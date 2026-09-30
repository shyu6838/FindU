package findu.backend.founditem.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.founditem.dto.*;
import findu.backend.founditem.service.FoundItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/found-items")
@Tag(name = "습득물", description = "습득물 게시물 등록, 조회, 검색 및 관리 API")
public class FoundItemController {

    final FoundItemService s;

    @PostMapping
    @Operation(summary = "습득물 등록")
    public FoundItemResponseDto create(
            @AuthenticationPrincipal Long uid,
            @Valid @RequestBody FoundItemRequestDto r
    ) {
        return s.create(uid, r);
    }

    @GetMapping
    @Operation(summary = "습득물 목록 조회")
    public List<FoundItemResponseDto> list() {
        return s.list();
    }

    // 습득물 키워드 검색
    @GetMapping("/search")
    @Operation(summary = "습득물 키워드 검색")
    public List<FoundItemResponseDto> search(
            @RequestParam String keyword
    ) {
        return s.search(keyword);
    }

    @GetMapping("/{id}")
    @Operation(summary = "습득물 상세 조회")
    public FoundItemResponseDto get(
            @PathVariable Long id
    ) {
        return s.get(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "습득물 수정")
    public FoundItemResponseDto update(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long id,
            @Valid @RequestBody FoundItemRequestDto r
    ) {
        return s.update(uid, id, r);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "습득물 삭제")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long id
    ) {
        s.delete(uid, id);
        return ResponseEntity.noContent().build();
    }
}
