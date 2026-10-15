package findu.backend.chat.dto;

import findu.backend.chat.entity.ChatRoom;

// 채팅방 정보를 반환하는 DTO
public record ChatRoomResponse(
        Long id,
        Long user1Id,
        Long user2Id,
        String user1Nickname,
        String user2Nickname,
        String user1Email,
        String user2Email,
        Long itemId,
        String itemTitle
) {

    // 엔티티를 DTO로 변환
    public static ChatRoomResponse from(ChatRoom x) {
        return new ChatRoomResponse(
                x.getId(),
                x.getUser1().getId(),
                x.getUser2().getId(),
                x.getUser1().getNickname(),
                x.getUser2().getNickname(),
                x.getUser1().getEmail(),
                x.getUser2().getEmail(),
                x.getItem() == null ? null : x.getItem().getId(),
                x.getItem() == null ? null : x.getItem().getTitle()
        );
    }
}