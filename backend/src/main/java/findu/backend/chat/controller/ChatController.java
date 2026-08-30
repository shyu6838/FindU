package findu.backend.chat.controller;

import findu.backend.chat.dto.*;
import findu.backend.chat.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat-rooms")
public class ChatController {

    private final ChatService s;

    @PostMapping
    public ChatRoomResponse create(
            @AuthenticationPrincipal Long uid,
            @Valid @RequestBody CreateRoomRequest r
    ) {
        return s.create(uid, r);
    }

    @GetMapping
    public List<ChatRoomResponse> rooms(
            @AuthenticationPrincipal Long uid
    ) {
        return s.rooms(uid);
    }

    @GetMapping("/{roomId}/messages")
    public List<ChatMessageResponse> messages(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long roomId
    ) {
        return s.messages(uid, roomId);
    }

    @PostMapping("/{roomId}/messages")
    public ChatMessageResponse send(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long roomId,
            @Valid @RequestBody SendMessageRequest r
    ) {
        return s.send(uid, roomId, r);
    }
}