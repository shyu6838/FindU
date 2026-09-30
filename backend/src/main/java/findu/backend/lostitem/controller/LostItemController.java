package findu.backend.lostitem.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.lostitem.dto.*;
import findu.backend.lostitem.service.LostItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lost-items")
@Tag(name = "분실물", description = "분실물 게시물 등록, 조회, 검색 및 관리 API")
public class LostItemController {

    private final LostItemService s;

    @PostMapping
    @Operation(summary = "분실물 등록")
    public LostItemResponseDto create(
            @AuthenticationPrincipal Long uid,
            @Valid @RequestBody LostItemRequestDto r
    ) {
        return s.create(uid, r);
    }

    @GetMapping
    @Operation(summary = "분실물 목록 조회")
    public List<LostItemResponseDto> list() {
        return s.list();
    }

    // 분실물 키워드 검색
    @GetMapping("/search")
    @Operation(summary = "분실물 키워드 검색")
    public List<LostItemResponseDto> search(
            @RequestParam String keyword
    ) {
        return s.search(keyword);
    }

    @GetMapping("/{id}")
    @Operation(summary = "분실물 상세 조회")
    public LostItemResponseDto get(
            @PathVariable Long id
    ) {
        return s.get(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "분실물 수정")
    public LostItemResponseDto update(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long id,
            @Valid @RequestBody LostItemRequestDto r
    ) {
        return s.update(uid, id, r);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "분실물 삭제")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long id
    ) {
        s.delete(uid, id);
        return ResponseEntity.noContent().build();
    }
}
