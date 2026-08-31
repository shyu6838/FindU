package findu.backend.chat.dto;

import findu.backend.chat.entity.ChatRoom;

public record ChatRoomResponse(
        Long id,
        Long user1Id,
        Long user2Id,
        String user1Nickname,
        String user2Nickname,
        Long itemId,
        String itemTitle
) {

    public static ChatRoomResponse from(ChatRoom x) {
        return new ChatRoomResponse(
                x.getId(),
                x.getUser1().getId(),
                x.getUser2().getId(),
                x.getUser1().getNickname(),
                x.getUser2().getNickname(),
                x.getItem() == null ? null : x.getItem().getId(),
                x.getItem() == null ? null : x.getItem().getTitle()
        );
    }
}
