package findu.backend.chat.repository;

import findu.backend.chat.entity.ChatRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRequestRepository
        extends JpaRepository<ChatRequest, Long> {

    List<ChatRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    List<ChatRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    Optional<ChatRequest> findByRequesterIdAndReceiverIdAndStatus(
            Long requesterId,
            Long receiverId,
            ChatRequest.Status status
    );
}