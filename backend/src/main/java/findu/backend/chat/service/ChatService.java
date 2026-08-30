package findu.backend.chat.service;

import findu.backend.chat.dto.*;
import findu.backend.chat.entity.*;
import findu.backend.chat.repository.*;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import findu.backend.chat.dto.ChatMessageRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository rooms;
    private final ChatMessageRepository msgs;
    private final UserRepository users;

    private User u(Long id) {
        return users.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );
    }

    private ChatRoom room(Long id) {
        return rooms.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "채팅방을 찾을 수 없습니다."
                        )
                );
    }

    private void member(ChatRoom r, Long uid) {
        if (!r.getUser1().getId().equals(uid)
                && !r.getUser2().getId().equals(uid)) {

            throw new IllegalStateException(
                    "채팅방 참여자가 아닙니다."
            );
        }
    }

    /**
     * 채팅방 생성
     *
     * 같은 두 사용자 사이에 이미 채팅방이 존재하면
     * 새로운 채팅방을 만들지 않고 기존 채팅방을 반환한다.
     */
    @Transactional
    public ChatRoomResponse create(
            Long uid,
            CreateRoomRequest r
    ) {

        if (uid.equals(r.userId())) {
            throw new IllegalArgumentException(
                    "본인과 채팅방을 만들 수 없습니다."
            );
        }

        // 1. 현재 로그인한 사용자
        User user1 = u(uid);

        // 2. 상대방 사용자
        User user2 = u(r.userId());

        // 3. 기존 채팅방 확인
        Optional<ChatRoom> existingRoom =
                rooms.findByUser1IdAndUser2Id(
                        uid,
                        r.userId()
                );

        if (existingRoom.isPresent()) {
            return ChatRoomResponse.from(
                    existingRoom.get()
            );
        }

        // 4. 반대 방향도 확인
        existingRoom =
                rooms.findByUser2IdAndUser1Id(
                        uid,
                        r.userId()
                );

        if (existingRoom.isPresent()) {
            return ChatRoomResponse.from(
                    existingRoom.get()
            );
        }

        // 5. 기존 채팅방이 없으면 새로 생성
        ChatRoom chatRoom = ChatRoom.builder()
                .user1(user1)
                .user2(user2)
                .build();

        return ChatRoomResponse.from(
                rooms.save(chatRoom)
        );
    }

    /**
     * 내가 참여하고 있는 채팅방 조회
     */
    @Transactional(readOnly = true)
    public List<ChatRoomResponse> rooms(Long uid) {

        return rooms
                .findByUser1IdOrUser2IdOrderByCreatedAtDesc(
                        uid,
                        uid
                )
                .stream()
                .map(ChatRoomResponse::from)
                .toList();
    }

    /**
     * 메시지 전송
     */
    @Transactional
    public ChatMessageResponse send(
            Long uid,
            Long roomId,
            SendMessageRequest r
    ) {

        ChatRoom room = room(roomId);

        // 채팅방 참여자인지 확인
        member(room, uid);

        ChatMessage message = ChatMessage.builder()
                .room(room)
                .sender(u(uid))
                .content(r.content())
                .build();

        return ChatMessageResponse.from(
                msgs.save(message)
        );
    }

    @Transactional
    public ChatMessageResponse sendWebSocket(
            Long uid,
            Long roomId,
            ChatMessageRequest r
    ) {
        ChatRoom chatRoom = room(roomId);

        // 채팅방 참여자인지 확인
        member(chatRoom, uid);

        ChatMessage message = ChatMessage.builder()
                .room(chatRoom)
                .sender(u(uid))
                .content(r.content())
                .build();

        return ChatMessageResponse.from(
                msgs.save(message)
        );
    }

    /**
     * 채팅 메시지 조회
     */
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> messages(
            Long uid,
            Long roomId
    ) {

        ChatRoom room = room(roomId);

        // 채팅방 참여자인지 확인
        member(room, uid);

        return msgs
                .findByRoomIdOrderByCreatedAtAsc(roomId)
                .stream()
                .map(ChatMessageResponse::from)
                .toList();
    }
}