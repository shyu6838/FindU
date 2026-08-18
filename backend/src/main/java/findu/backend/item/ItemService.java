// ItemService.java

package findu.backend.item;

import findu.backend.category.entity.Category;
import findu.backend.category.repository.CategoryRepository;
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

    // 새로운 게시물 생성
    @Transactional
    public ItemResponseDto createItem(ItemRequestDto requestDto, String userEmail) {
        User user = null;

        // 이메일 기반으로 유저 정보 조회
        if (userEmail != null && !userEmail.equals("anonymousUser")) {
            user = userRepository.findByEmail(userEmail).orElse(null);
            if (user == null) {
                try {
                    Long userId = Long.parseLong(userEmail);
                    user = userRepository.findById(userId).orElse(null);
                } catch (NumberFormatException ignored) {}
            }
        }

        // 카테고리 정보 조회
        Category category = null;
        if (requestDto.getCategoryId() != null) {
            category = categoryRepository.findById(requestDto.getCategoryId()).orElse(null);
        }

        // 게시물 엔티티 생성 및 저장
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
        return ItemResponseDto.from(savedItem);
    }

    // 조건에 맞는 게시물 목록 조회
    public List<ItemResponseDto> getItems(ItemType type) {
        List<Item> items = (type != null) ? 
                itemRepository.findByTypeOrderByCreatedAtDesc(type) : 
                itemRepository.findAllByOrderByCreatedAtDesc();
        return items.stream().map(ItemResponseDto::from).toList();
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
                requestDto.getQuestion(),
                requestDto.getAnswer(),
                category
        );

        return ItemResponseDto.from(item);
    }

    // 특정 게시물 삭제
    @Transactional
    public void deleteItem(Long id, String userEmail) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다. id=" + id));
        itemRepository.delete(item);
    }
}