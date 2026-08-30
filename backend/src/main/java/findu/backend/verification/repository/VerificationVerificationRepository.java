package findu.backend.verification.repository;

import findu.backend.verification.entity.VerificationVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationVerificationRepository
        extends JpaRepository<VerificationVerification, Long> {

    Optional<VerificationVerification> findByUserIdAndFoundItemId(
            Long userId,
            Long foundItemId
    );

    boolean existsByUserIdAndFoundItemId(
            Long userId,
            Long foundItemId
    );
}