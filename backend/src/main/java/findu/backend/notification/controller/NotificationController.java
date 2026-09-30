package findu.backend.notification.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.notification.dto.*;
import findu.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
@Tag(name = "알림", description = "채팅 매칭과 새 메시지 알림을 관리하는 API")
public class NotificationController {
    
    private final NotificationService s;

    @GetMapping
    @Operation(summary = "내 알림 목록 조회", description = "최신 순으로 현재 사용자의 알림을 조회합니다.")
    public List<NotificationResponse> list(@AuthenticationPrincipal Long uid) {
        return s.list(uid);
    }

    @PatchMapping("/read-all")
    @Operation(summary = "모든 알림 읽음 처리")
    public ResponseEntity<Void> readAll(@AuthenticationPrincipal Long uid) {
        s.readAll(uid);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "알림 한 건 읽음 처리")
    public ResponseEntity<Void> read(@AuthenticationPrincipal Long uid, @PathVariable Long id) {
        s.read(uid, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Operation(summary = "모든 알림 삭제")
    public ResponseEntity<Void> deleteAll(@AuthenticationPrincipal Long uid) {
        s.deleteAll(uid);
        return ResponseEntity.noContent().build();
    }
}
