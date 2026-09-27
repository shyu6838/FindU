package findu.backend.match.service;

import findu.backend.ai.client.AiClient;
import findu.backend.ai.dto.AiImageEmbeddingResponse;
import findu.backend.ai.dto.AiTextEmbeddingResponse;
import findu.backend.founditem.entity.FoundItem;
import findu.backend.founditem.repository.FoundItemRepository;
import findu.backend.lostitem.entity.LostItem;
import findu.backend.lostitem.repository.LostItemRepository;
import findu.backend.match.dto.MatchResponseDto;
import findu.backend.match.entity.ItemMatch;
import findu.backend.match.repository.ItemMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.io.UrlResource;
import org.springframework.util.StringUtils;

import java.net.MalformedURLException;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final ItemMatchRepository itemMatchRepository;
    private final AiClient aiClient;

    @Transactional
    public List<MatchResponseDto> matchFoundItems(Long lostItemId) {

        LostItem lostItem = lostItemRepository.findById(lostItemId)
                .orElseThrow(() ->
                        new IllegalArgumentException("분실물을 찾을 수 없습니다.")
                );

        List<ItemMatch> matches =
                foundItemRepository.findAll().stream()
                        .map(foundItem -> createMatch(lostItem, foundItem))
                        .sorted(Comparator.comparing(ItemMatch::getFinalScore).reversed())
                        .limit(5)
                        .toList();

        itemMatchRepository.saveAll(matches);

        return matches.stream()
                .map(MatchResponseDto::from)
                .toList();
    }

    private ItemMatch createMatch(
            LostItem lostItem,
            FoundItem foundItem
    ) {
        double textScore = calculateTextScore(lostItem, foundItem);
        double imageScore = calculateImageScore(lostItem, foundItem, textScore);
        double locationScore = calculateLocationScore(lostItem, foundItem);
        double timeScore = calculateTimeScore(lostItem, foundItem);

        double finalScore =
                imageScore * 0.6
                        + textScore * 0.2
                        + locationScore * 0.1
                        + timeScore * 0.1;

        return ItemMatch.builder()
                .lostItem(lostItem)
                .foundItem(foundItem)
                .imageScore(imageScore)
                .textScore(textScore)
                .locationScore(locationScore)
                .timeScore(timeScore)
                .finalScore(finalScore)
                .build();
    }

    private double calculateTextScore(
            LostItem lostItem,
            FoundItem foundItem
    ) {
        AiTextEmbeddingResponse lostEmbedding = aiClient.embedText(toText(lostItem));
        AiTextEmbeddingResponse foundEmbedding = aiClient.embedText(toText(foundItem));
        return cosineSimilarity(lostEmbedding.embedding(), foundEmbedding.embedding());
    }

    private double calculateImageScore(
            LostItem lostItem,
            FoundItem foundItem,
            double fallbackScore
    ) {
        if (!StringUtils.hasText(lostItem.getImageUrl()) || !StringUtils.hasText(foundItem.getImageUrl())) {
            return fallbackScore;
        }

        try {
            UrlResource lostImage = new UrlResource(lostItem.getImageUrl());
            UrlResource foundImage = new UrlResource(foundItem.getImageUrl());
            AiImageEmbeddingResponse lostEmbedding = aiClient.embedImage(lostImage, lostImage.getFilename());
            AiImageEmbeddingResponse foundEmbedding = aiClient.embedImage(foundImage, foundImage.getFilename());
            return cosineSimilarity(lostEmbedding.embedding(), foundEmbedding.embedding());
        } catch (MalformedURLException | RuntimeException e) {
            return fallbackScore;
        }
    }

    private String toText(LostItem item) {
        return item.getTitle() + "\n" + item.getDescription() + "\n" + item.getLocation();
    }

    private String toText(FoundItem item) {
        return item.getTitle() + "\n" + item.getDescription() + "\n" + item.getLocation();
    }

    private double cosineSimilarity(List<Double> left, List<Double> right) {
        if (left == null || right == null || left.size() != 512 || right.size() != 512) {
            throw new IllegalStateException("AI 서버가 512차원 임베딩을 반환하지 않았습니다.");
        }

        double dotProduct = 0;
        double leftMagnitude = 0;
        double rightMagnitude = 0;

        for (int index = 0; index < left.size(); index++) {
            double leftValue = left.get(index);
            double rightValue = right.get(index);
            dotProduct += leftValue * rightValue;
            leftMagnitude += leftValue * leftValue;
            rightMagnitude += rightValue * rightValue;
        }

        if (leftMagnitude == 0 || rightMagnitude == 0) {
            return 0;
        }

        return Math.max(0, Math.min(1,
                (dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude)) + 1) / 2));
    }

    private double calculateLocationScore(
            LostItem lostItem,
            FoundItem foundItem
    ) {
        if (lostItem.getLocation() == null ||
                foundItem.getLocation() == null) {
            return 0.5;
        }

        if (lostItem.getLocation().equals(foundItem.getLocation())) {
            return 1.0;
        }

        return 0.5;
    }

    private double calculateTimeScore(
            LostItem lostItem,
            FoundItem foundItem
    ) {
        long hours =
                Math.abs(
                        Duration.between(
                                lostItem.getLostAt(),
                                foundItem.getFoundAt()
                        ).toHours()
                );

        if (hours <= 24) {
            return 1.0;
        }

        if (hours <= 72) {
            return 0.7;
        }

        if (hours <= 168) {
            return 0.4;
        }

        return 0.2;
    }

    @Transactional(readOnly = true)
    public List<MatchResponseDto> getFoundMatches(Long lostItemId) {
        return itemMatchRepository
                .findByLostItemIdOrderByFinalScoreDesc(lostItemId)
                .stream()
                .map(MatchResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchResponseDto> getLostMatches(Long foundItemId) {
        return itemMatchRepository
                .findByFoundItemIdOrderByFinalScoreDesc(foundItemId)
                .stream()
                .map(MatchResponseDto::from)
                .toList();
    }
}
