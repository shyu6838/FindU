package findu.backend.ai.service;

import findu.backend.ai.client.AiClient;
import findu.backend.ai.dto.AiImageEmbeddingResponse;
import findu.backend.ai.dto.AiTextEmbeddingResponse;
import findu.backend.ai.repository.ItemEmbeddingRepository;
import findu.backend.item.dto.ItemResponseDto;
import findu.backend.item.entity.Item;
import findu.backend.item.entity.ItemStatus;
import findu.backend.item.entity.ItemType;
import findu.backend.item.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;

import java.net.MalformedURLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemEmbeddingService {

    private static final int VECTOR_DIMENSION = 512;
    private static final int MAX_RESULT_SIZE = 20;

    private final AiClient aiClient;
    private final ItemEmbeddingRepository itemEmbeddingRepository;
    private final ItemRepository itemRepository;

    @Transactional
    public int indexMissingItems() {
        if (!itemEmbeddingRepository.isAvailable()) {
            return 0;
        }

        int indexedCount = 0;
        for (Item item : itemRepository.findAllByOrderByCreatedAtDesc()) {
            if (!itemEmbeddingRepository.hasEmbedding(item.getId()) && index(item)) {
                indexedCount++;
            }
        }

        return indexedCount;
    }

    public boolean index(Item item) {
        if (!itemEmbeddingRepository.isAvailable()) {
            log.warn("게시글 {}의 임베딩을 저장하지 못했습니다. pgvector가 준비되지 않았습니다.", item.getId());
            return false;
        }

        try {
            AiTextEmbeddingResponse textResponse = aiClient.embedText(buildText(item));
            String textEmbedding = toVector(textResponse.embedding(), "텍스트");
            String imageEmbedding = createImageEmbedding(item);

            itemEmbeddingRepository.upsert(item.getId(), textEmbedding, imageEmbedding);
            return true;
        } catch (RuntimeException e) {
            log.warn("게시글 {}의 임베딩 생성에 실패했습니다: {}", item.getId(), e.getMessage());
            return false;
        }
    }

    public List<ItemResponseDto> findSimilar(Item source, int requestedLimit) {
        if (!itemEmbeddingRepository.isAvailable()) {
            throw new IllegalStateException("AI 유사도 검색을 사용하려면 PostgreSQL의 pgvector 확장을 설치해야 합니다.");
        }

        if (!itemEmbeddingRepository.hasEmbedding(source.getId()) && !index(source)) {
            throw new IllegalStateException("게시글 임베딩을 생성하지 못했습니다. AI 서버 연결을 확인해주세요.");
        }

        ItemType targetType = source.getType() == ItemType.LOST ? ItemType.FOUND : ItemType.LOST;
        List<Item> candidates = itemRepository.findByTypeAndStatusOrderByCreatedAtDesc(targetType, ItemStatus.SEARCHING);

        for (Item candidate : candidates) {
            if (!itemEmbeddingRepository.hasEmbedding(candidate.getId())) {
                index(candidate);
            }
        }

        int limit = Math.min(Math.max(requestedLimit, 1), MAX_RESULT_SIZE);
        List<ItemEmbeddingRepository.SimilarEmbedding> ranked =
                itemEmbeddingRepository.findSimilar(source.getId(), targetType, limit);

        Map<Long, Item> itemsById = new HashMap<>();
        itemRepository.findAllById(ranked.stream()
                        .map(ItemEmbeddingRepository.SimilarEmbedding::itemId)
                        .toList())
                .forEach(item -> itemsById.put(item.getId(), item));

        return ranked.stream()
                .map(result -> {
                    Item item = itemsById.get(result.itemId());
                    return item == null ? null : ItemResponseDto.from(item, toPercent(result.similarity()));
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public List<ItemResponseDto> searchByText(
            ItemType itemType,
            String query,
            Long categoryId,
            int requestedLimit
    ) {
        if (!itemEmbeddingRepository.isAvailable()) {
            throw new IllegalStateException("AI 검색을 사용하려면 PostgreSQL의 pgvector 확장을 설치해야 합니다.");
        }

        List<Item> candidates = itemRepository
                .findByTypeAndStatusOrderByCreatedAtDesc(itemType, ItemStatus.SEARCHING)
                .stream()
                .filter(item -> categoryId == null
                        || (item.getCategory() != null && categoryId.equals(item.getCategory().getId())))
                .toList();

        for (Item candidate : candidates) {
            if (!itemEmbeddingRepository.hasEmbedding(candidate.getId())) {
                index(candidate);
            }
        }

        AiTextEmbeddingResponse response = aiClient.embedText(query.trim());
        String queryEmbedding = toVector(response.embedding(), "검색어");
        int limit = Math.min(Math.max(requestedLimit, 1), MAX_RESULT_SIZE);
        List<ItemEmbeddingRepository.SimilarEmbedding> ranked =
                itemEmbeddingRepository.searchByText(queryEmbedding, itemType, categoryId, limit);

        Map<Long, Item> itemsById = new HashMap<>();
        itemRepository.findAllById(ranked.stream()
                        .map(ItemEmbeddingRepository.SimilarEmbedding::itemId)
                        .toList())
                .forEach(item -> itemsById.put(item.getId(), item));

        return ranked.stream()
                .map(result -> {
                    Item item = itemsById.get(result.itemId());
                    return item == null ? null : ItemResponseDto.from(item, toPercent(result.similarity()));
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    private String createImageEmbedding(Item item) {
        if (!StringUtils.hasText(item.getImageUrl())) {
            return null;
        }

        try {
            UrlResource image = new UrlResource(item.getImageUrl());
            AiImageEmbeddingResponse response = aiClient.embedImage(image, image.getFilename());
            return toVector(response.embedding(), "이미지");
        } catch (MalformedURLException | RuntimeException e) {
            log.warn("게시글 {}의 이미지 임베딩을 건너뜁니다: {}", item.getId(), e.getMessage());
            return null;
        }
    }

    private String buildText(Item item) {
        return List.of(
                        "제목: " + nullToEmpty(item.getTitle()),
                        "설명: " + nullToEmpty(item.getContent()),
                        "카테고리: " + (item.getCategory() == null ? "" : nullToEmpty(item.getCategory().getName())),
                        "장소: " + nullToEmpty(item.getLocation())
                ).stream()
                .filter(value -> !value.endsWith(": "))
                .collect(Collectors.joining("\n"));
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private String toVector(List<Double> embedding, String embeddingType) {
        if (embedding == null || embedding.size() != VECTOR_DIMENSION) {
            throw new IllegalStateException(embeddingType + " 임베딩 차원이 " + VECTOR_DIMENSION + "이 아닙니다.");
        }

        return embedding.stream()
                .map(value -> {
                    if (value == null || !Double.isFinite(value)) {
                        throw new IllegalStateException(embeddingType + " 임베딩에 올바르지 않은 값이 있습니다.");
                    }
                    return Double.toString(value);
                })
                .collect(Collectors.joining(",", "[", "]"));
    }

    private double toPercent(double similarity) {
        return Math.round(Math.max(0, Math.min(1, similarity)) * 1_000) / 10.0;
    }
}
