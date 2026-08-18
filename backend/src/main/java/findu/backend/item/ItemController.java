// ItemController.java

package findu.backend.item;

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
public class ItemController {

    private final ItemService itemService;

    // 게시물 작성
    @PostMapping
    public ResponseEntity<ItemResponseDto> createItem(
            @RequestBody ItemRequestDto requestDto,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        ItemResponseDto response = itemService.createItem(requestDto, userEmail);
        return ResponseEntity.ok(response);
    }

    // 게시물 목록 조회
    @GetMapping
    public ResponseEntity<List<ItemResponseDto>> getItems(@RequestParam(required = false) ItemType type) {
        List<ItemResponseDto> response = itemService.getItems(type);
        return ResponseEntity.ok(response);
    }

    // 게시물 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDto> getItem(@PathVariable Long id) {
        ItemResponseDto response = itemService.getItem(id);
        return ResponseEntity.ok(response);
    }

    // 게시물 수정
    @PutMapping("/{id}")
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
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        itemService.deleteItem(id, userEmail);
        return ResponseEntity.ok().build();
    }
}