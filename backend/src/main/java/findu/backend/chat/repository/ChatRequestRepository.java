package findu.backend.chat.repository;

import findu.backend.chat.entity.ChatRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRequestRepository
        extends JpaRepository<ChatRequest, Long> {

    List<ChatRequest> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    List<ChatRequest> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);

    boolean existsByRequesterIdAndItemIdAndStatus(Long requesterId, Long itemId, ChatRequest.Status status);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select r from ChatRequest r where r.id = :id")
    Optional<ChatRequest> lockById(@org.springframework.data.repository.query.Param("id") Long id);

    Optional<ChatRequest> findByRequesterIdAndReceiverIdAndStatus(
            Long requesterId,
            Long receiverId,
            ChatRequest.Status status
    );
}