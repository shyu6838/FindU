package findu.backend.trust.repository;

import findu.backend.trust.entity.TrustEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrustEventRepository
        extends JpaRepository<TrustEvent, Long> {

    List<TrustEvent> findByUserIdOrderByCreatedAtDesc(Long userId);
}