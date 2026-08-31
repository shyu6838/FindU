package findu.backend.chat.repository;

import findu.backend.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    List<ChatRoom> findByUser1IdOrUser2IdOrderByCreatedAtDesc(
            Long user1Id,
            Long user2Id
    );

    Optional<ChatRoom> findByUser1IdAndUser2Id(
            Long user1Id,
            Long user2Id
    );

    Optional<ChatRoom> findByUser2IdAndUser1Id(
            Long user2Id,
            Long user1Id
    );
}