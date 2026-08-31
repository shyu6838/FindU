package findu.backend.lostitem.service;

import findu.backend.category.entity.Category;
import findu.backend.category.repository.CategoryRepository;
import findu.backend.lostitem.dto.*;
import findu.backend.lostitem.entity.LostItem;
import findu.backend.lostitem.repository.LostItemRepository;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class LostItemService {

    private final LostItemRepository repo;
    private final UserRepository users;
    private final CategoryRepository cats;

    private User user(Long id) {
        return users.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );
    }

    private Category cat(Long id) {
        return cats.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "카테고리를 찾을 수 없습니다."
                        )
                );
    }

    @Transactional
    public LostItemResponseDto create(
            Long uid,
            LostItemRequestDto r
    ) {
        LostItem x = LostItem.builder()
                .user(user(uid))
                .category(cat(r.getCategoryId()))
                .title(r.getTitle())
                .description(r.getDescription())
                .imageUrl(r.getImageUrl())
                .location(r.getLocation())
                .lostAt(r.getLostAt())
                .build();

        return LostItemResponseDto.from(repo.save(x));
    }

    @Transactional(readOnly = true)
    public List<LostItemResponseDto> list() {
        return repo.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(LostItemResponseDto::from)
                .toList();
    }

    // 분실물 키워드 검색
    @Transactional(readOnly = true)
    public List<LostItemResponseDto> search(String keyword) {

        return repo
                .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrLocationContainingIgnoreCaseOrderByCreatedAtDesc(
                        keyword,
                        keyword,
                        keyword
                )
                .stream()
                .map(LostItemResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public LostItemResponseDto get(Long id) {
        return LostItemResponseDto.from(
                repo.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "분실물을 찾을 수 없습니다."
                                )
                        )
        );
    }

    @Transactional
    public LostItemResponseDto update(
            Long uid,
            Long id,
            LostItemRequestDto r
    ) {
        LostItem x = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "분실물을 찾을 수 없습니다."
                        )
                );

        if (!x.getUser().getId().equals(uid)) {
            throw new IllegalStateException(
                    "본인의 게시글만 수정할 수 있습니다."
            );
        }

        x.update(
                cat(r.getCategoryId()),
                r.getTitle(),
                r.getDescription(),
                r.getImageUrl(),
                r.getLocation(),
                r.getLostAt()
        );

        return LostItemResponseDto.from(x);
    }

    @Transactional
    public void delete(
            Long uid,
            Long id
    ) {
        LostItem x = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "분실물을 찾을 수 없습니다."
                        )
                );

        if (!x.getUser().getId().equals(uid)) {
            throw new IllegalStateException(
                    "본인의 게시글만 삭제할 수 있습니다."
            );
        }

        repo.delete(x);
    }
}