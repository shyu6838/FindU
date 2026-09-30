// ItemController.java

package findu.backend.item.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.item.dto.ItemRequestDto;
import findu.backend.item.dto.ItemResponseDto;
import findu.backend.item.entity.ItemStatus;
import findu.backend.item.entity.ItemType;
import findu.backend.item.service.ItemService;
import findu.backend.verification.dto.VerificationAnswerRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 게시물 관련 API 요청을 처리하는 컨트롤러
@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/items")
@Tag(name = "통합 게시물", description = "분실물과 습득물의 등록, 조회, 검색 및 유사 게시물 추천 API")
public class ItemController {

    private final ItemService itemService;

    // 게시물 작성
    @PostMapping
    @Operation(summary = "게시물 등록", description = "분실물 또는 습득물 게시물을 등록합니다.")
    @SecurityRequirements
    public ResponseEntity<ItemResponseDto> createItem(
            @RequestBody ItemRequestDto requestDto,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ItemResponseDto response = itemService.createItem(requestDto, userEmail);
        return ResponseEntity.ok(response);
    }

    // 게시물 목록 조회
    @GetMapping
    @Operation(summary = "게시물 목록 조회", description = "type으로 분실물 또는 습득물 게시물 목록을 조회합니다.")
    @SecurityRequirements
    public ResponseEntity<List<ItemResponseDto>> getItems(@RequestParam(required = false) ItemType type) {
        List<ItemResponseDto> response = itemService.getItems(type);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "AI 의미 기반 게시물 검색", description = "검색어를 임베딩해 유형과 카테고리에 맞는 유사 게시물을 반환합니다.")
    @SecurityRequirements
    public ResponseEntity<List<ItemResponseDto>> searchItems(
            @RequestParam ItemType type,
            @RequestParam String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(itemService.searchItems(type, query, categoryId, limit));
    }

    // 게시물 상세 조회
    @GetMapping("/{id}")
    @Operation(summary = "게시물 상세 조회")
    @SecurityRequirements
    public ResponseEntity<ItemResponseDto> getItem(@PathVariable Long id) {
        ItemResponseDto response = itemService.getItem(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/similar")
    @Operation(summary = "유사 게시물 추천", description = "게시물 이미지와 텍스트 임베딩을 기준으로 반대 유형의 유사 게시물을 조회합니다.")
    @SecurityRequirements
    public ResponseEntity<List<ItemResponseDto>> getSimilarItems(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(itemService.getSimilarItems(id, limit));
    }

    // 게시물 수정
    @PutMapping("/{id}")
    @Operation(summary = "게시물 수정", description = "작성자가 제목, 설명, 카테고리, 위치 및 시간 정보를 수정합니다.")
    @SecurityRequirements
    public ResponseEntity<ItemResponseDto> updateItem(
            @PathVariable Long id,
            @RequestBody ItemRequestDto requestDto,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ItemResponseDto response = itemService.updateItem(id, requestDto, userEmail);
        return ResponseEntity.ok(response);
    }

    // 게시물 삭제
    @DeleteMapping("/{id}")
    @Operation(summary = "게시물 삭제", description = "작성자가 본인 게시물을 삭제합니다.")
    @SecurityRequirements
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        itemService.deleteItem(id, userEmail);
        return ResponseEntity.ok().build();
    }

    // 상태 변경 API (RESOLVED 또는 SEARCHING)
    @PatchMapping("/{id}/status")
    @Operation(summary = "게시물 상태 변경", description = "게시물을 SEARCHING 또는 RESOLVED 상태로 변경합니다.")
    @SecurityRequirements
    public ResponseEntity<Void> updateItemStatus(@PathVariable Long id, @RequestParam String status) {
        itemService.updateItemStatus(id, ItemStatus.valueOf(status));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/verify")
    @Operation(summary = "게시물 본인 확인 답변 검증")
    @SecurityRequirements
    public ResponseEntity<Boolean> verifyItemAnswer(
            @PathVariable Long id,
            @RequestBody VerificationAnswerRequest request) {
        return ResponseEntity.ok(itemService.verifyItemAnswer(id, request.answer()));
    }
}
