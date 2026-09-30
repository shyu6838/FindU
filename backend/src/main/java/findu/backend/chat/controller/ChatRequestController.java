package findu.backend.chat.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.chat.dto.ChatRequestResponse;
import findu.backend.chat.service.ChatRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat-requests")
@Tag(name = "채팅 요청", description = "본인 확인 후 채팅 요청을 보내고 수락 또는 거절하는 API")
public class ChatRequestController {

    private final ChatRequestService service;

    @PostMapping
    @Operation(summary = "채팅 요청 생성", description = "습득물 작성자에게 채팅 요청을 보냅니다.")
    public ChatRequestResponse create(
            @AuthenticationPrincipal Long uid,
            @RequestParam Long receiverId,
            @RequestParam Long foundItemId
    ) {
        return service.create(
                uid,
                receiverId,
                foundItemId
        );
    }

    @GetMapping("/received")
    @Operation(summary = "받은 채팅 요청 목록 조회")
    public List<ChatRequestResponse> received(
            @AuthenticationPrincipal Long uid
    ) {
        return service.received(uid);
    }

    @GetMapping("/sent")
    @Operation(summary = "보낸 채팅 요청 목록 조회")
    public List<ChatRequestResponse> sent(
            @AuthenticationPrincipal Long uid
    ) {
        return service.sent(uid);
    }

    @PatchMapping("/{requestId}/accept")
    @Operation(summary = "채팅 요청 수락", description = "요청을 수락하고 양쪽 사용자에게 매칭 알림을 생성합니다.")
    public ChatRequestResponse accept(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long requestId
    ) {
        return service.accept(uid, requestId);
    }

    @PatchMapping("/{requestId}/reject")
    @Operation(summary = "채팅 요청 거절")
    public ChatRequestResponse reject(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long requestId
    ) {
        return service.reject(uid, requestId);
    }
}
