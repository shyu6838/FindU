package findu.backend.chat.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "채팅", description = "채팅방 생성, 목록, 메시지 조회와 전송 API")
public class ChatController {

    private final ChatService s;

    @PostMapping
    @Operation(summary = "채팅방 생성", description = "확정된 연결 게시물에 대한 채팅방을 생성합니다.")
    public ChatRoomResponse create(
            @AuthenticationPrincipal Long uid,
            @Valid @RequestBody CreateRoomRequest r
    ) {
        return s.create(uid, r);
    }

    @GetMapping
    @Operation(summary = "내 채팅방 목록 조회")
    public List<ChatRoomResponse> rooms(
            @AuthenticationPrincipal Long uid
    ) {
        return s.rooms(uid);
    }

    @GetMapping("/{roomId}")
    @Operation(summary = "채팅방 상세 조회")
    public ChatRoomResponse room(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long roomId
    ) {
        return s.room(uid, roomId);
    }

    @GetMapping("/{roomId}/messages")
    @Operation(summary = "채팅 메시지 목록 조회")
    public List<ChatMessageResponse> messages(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long roomId
    ) {
        return s.messages(uid, roomId);
    }

    @PostMapping("/{roomId}/messages")
    @Operation(summary = "채팅 메시지 전송", description = "REST 방식으로 채팅 메시지를 저장하고 상대방에게 알림을 생성합니다.")
    public ChatMessageResponse send(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long roomId,
            @Valid @RequestBody SendMessageRequest r
    ) {
        return s.send(uid, roomId, r);
    }
}
