package findu.backend.chat.controller;

import findu.backend.chat.dto.ChatRequestResponse;
import findu.backend.chat.service.ChatRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat-requests")
public class ChatRequestController {

    private final ChatRequestService service;

    @PostMapping
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
    public List<ChatRequestResponse> received(
            @AuthenticationPrincipal Long uid
    ) {
        return service.received(uid);
    }

    @GetMapping("/sent")
    public List<ChatRequestResponse> sent(
            @AuthenticationPrincipal Long uid
    ) {
        return service.sent(uid);
    }

    @PatchMapping("/{requestId}/accept")
    public ChatRequestResponse accept(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long requestId
    ) {
        return service.accept(uid, requestId);
    }

    @PatchMapping("/{requestId}/reject")
    public ChatRequestResponse reject(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long requestId
    ) {
        return service.reject(uid, requestId);
    }
}