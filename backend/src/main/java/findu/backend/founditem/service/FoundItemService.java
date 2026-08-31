package findu.backend.founditem.service;

import findu.backend.category.entity.Category;
import findu.backend.category.repository.CategoryRepository;
import findu.backend.founditem.dto.*;
import findu.backend.founditem.entity.FoundItem;
import findu.backend.founditem.repository.FoundItemRepository;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class FoundItemService {

    final FoundItemRepository repo;
    final UserRepository users;
    final CategoryRepository cats;

    private User u(Long i) {
        return users.findById(i)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );
    }

    private Category c(Long i) {
        return cats.findById(i)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "카테고리를 찾을 수 없습니다."
                        )
                );
    }

    @Transactional
    public FoundItemResponseDto create(
            Long uid,
            FoundItemRequestDto r
    ) {
        return FoundItemResponseDto.from(
                repo.save(
                        FoundItem.builder()
                                .user(u(uid))
                                .category(c(r.getCategoryId()))
                                .title(r.getTitle())
                                .description(r.getDescription())
                                .imageUrl(r.getImageUrl())
                                .location(r.getLocation())
                                .foundAt(r.getFoundAt())
                                .build()
                )
        );
    }

    @Transactional(readOnly = true)
    public List<FoundItemResponseDto> list() {

        return repo.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(FoundItemResponseDto::from)
                .toList();
    }

    // 습득물 키워드 검색
    @Transactional(readOnly = true)
    public List<FoundItemResponseDto> search(String keyword) {

        return repo
                .findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrLocationContainingIgnoreCaseOrderByCreatedAtDesc(
                        keyword,
                        keyword,
                        keyword
                )
                .stream()
                .map(FoundItemResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public FoundItemResponseDto get(Long id) {

        return FoundItemResponseDto.from(
                repo.findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "습득물을 찾을 수 없습니다."
                                )
                        )
        );
    }

    @Transactional
    public FoundItemResponseDto update(
            Long uid,
            Long id,
            FoundItemRequestDto r
    ) {

        FoundItem x = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "습득물을 찾을 수 없습니다."
                        )
                );

        if (!x.getUser().getId().equals(uid)) {
            throw new IllegalStateException(
                    "본인의 게시글만 수정할 수 있습니다."
            );
        }

        x.update(
                c(r.getCategoryId()),
                r.getTitle(),
                r.getDescription(),
                r.getImageUrl(),
                r.getLocation(),
                r.getFoundAt()
        );

        return FoundItemResponseDto.from(x);
    }

    @Transactional
    public void delete(
            Long uid,
            Long id
    ) {

        FoundItem x = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "습득물을 찾을 수 없습니다."
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