package findu.backend.item.service;

import findu.backend.category.entity.Category;
import findu.backend.category.repository.CategoryRepository;
import findu.backend.ai.service.ItemEmbeddingService;
import findu.backend.item.entity.ItemStatus;
import findu.backend.item.entity.ItemType;
import findu.backend.item.dto.ItemRequestDto;
import findu.backend.item.dto.ItemResponseDto;
import findu.backend.item.entity.Item;
import findu.backend.item.repository.ItemRepository;
import findu.backend.notification.service.NotificationService;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// 게시물 관련 비즈니스 로직을 처리하는 서비스
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ItemEmbeddingService itemEmbeddingService;
    private final NotificationService notificationService;

    // 새로운 게시물 생성
    @Transactional
    public ItemResponseDto createItem(ItemRequestDto requestDto, String userEmail) {
        User user = null;

        if (userEmail != null && !userEmail.equals("anonymousUser")) {
            user = userRepository.findByEmail(userEmail).orElse(null);
            if (user == null) {
                try {
                    Long userId = Long.parseLong(userEmail);
                    user = userRepository.findById(userId).orElse(null);
                } catch (NumberFormatException ignored) {}
            }
        }

        Category category = null;
        if (requestDto.getCategoryId() != null) {
            category = categoryRepository.findById(requestDto.getCategoryId()).orElse(null);
        }

        Item item = Item.builder()
                .type(requestDto.getType())
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .location(requestDto.getLocation())
                .eventDate(requestDto.getEventDate())
                .imageUrl(requestDto.getImageUrl())
                .question(requestDto.getQuestion())
                .answer(requestDto.getAnswer())
                .status(ItemStatus.SEARCHING)
                .category(category)
                .user(user)
                .build();

        Item savedItem = itemRepository.save(item);
        itemEmbeddingService.index(savedItem);
        return ItemResponseDto.from(savedItem);
    }

    // 조건에 맞는 게시물 목록 조회
    public List<ItemResponseDto> getItems(ItemType type) {
        List<Item> items = (type != null) ? 
                itemRepository.findByTypeOrderByCreatedAtDesc(type) : 
                itemRepository.findAllByOrderByCreatedAtDesc();
        return items.stream().map(ItemResponseDto::from).toList();
    }

    // 게시물 검색
    @Transactional
    public List<ItemResponseDto> searchItems(ItemType type, String query, Long categoryId, int limit) {
        if (query == null || query.isBlank()) {
            return getItems(type).stream()
                    .filter(item -> categoryId == null || categoryId.equals(item.getCategoryId()))
                    .toList();
        }

        return itemEmbeddingService.searchByText(type, query, categoryId, limit);
    }

    // 특정 게시물 상세 조회
    public ItemResponseDto getItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + id));
        return ItemResponseDto.from(item);
    }

    // 특정 게시물 수정
    @Transactional
    public ItemResponseDto updateItem(Long id, ItemRequestDto requestDto, String userEmail) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + id));

        Category category = null;
        if (requestDto.getCategoryId() != null) {
            category = categoryRepository.findById(requestDto.getCategoryId()).orElse(null);
        }

        item.update(
                requestDto.getTitle(),
                requestDto.getContent(),
                requestDto.getLocation(),
                requestDto.getEventDate(),
                requestDto.getImageUrl(),
                requestDto.getQuestion(),
                requestDto.getAnswer(),
                category
        );

        itemEmbeddingService.index(item);
        return ItemResponseDto.from(item);
    }

    // 유사 게시물 조회
    @Transactional
    public List<ItemResponseDto> getSimilarItems(Long id, int limit) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + id));
        return itemEmbeddingService.findSimilar(item, limit);
    }

    // 특정 게시물 삭제
    @Transactional
    public void deleteItem(Long id, String userEmail) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + id));
        itemRepository.delete(item);
    }

    // 게시물 상태 업데이트 (기본)
    @Transactional
    public void updateItemStatus(Long id, ItemStatus status) {
        updateItemStatus(id, status, null);
    }

    // 게시물 상태 업데이트 및 대상자 후기 요청 알림 발송
    @Transactional
    public void updateItemStatus(Long id, ItemStatus status, Long targetUserId) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + id));
        
        item.updateStatus(status); 

        if (status == ItemStatus.RESOLVED && targetUserId != null) {
            notificationService.create(
                    targetUserId,
                    "REVIEW_REQUEST",
                    "[" + item.getTitle() + "] 후기가 도착했습니다. 진행 과정은 어떠셨나요?",
                    item.getId()
            );
        }
    }

    // 게시물 답변 검증
    public boolean verifyItemAnswer(Long id, String answer) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + id));

        if (item.getAnswer() == null || answer == null) {
            return false;
        }

        return item.getAnswer().trim().equalsIgnoreCase(answer.trim());
    }
}