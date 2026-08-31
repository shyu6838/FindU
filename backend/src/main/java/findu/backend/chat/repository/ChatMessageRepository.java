package findu.backend.chat.repository;

import findu.backend.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByRoomIdOrderByCreatedAtAsc(Long id);
}