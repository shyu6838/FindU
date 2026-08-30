package findu.backend.match.repository;

import findu.backend.match.entity.ItemMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemMatchRepository
        extends JpaRepository<ItemMatch, Long> {

    List<ItemMatch> findByLostItemIdOrderByFinalScoreDesc(Long lostItemId);

    List<ItemMatch> findByFoundItemIdOrderByFinalScoreDesc(Long foundItemId);

    boolean existsByFoundItemIdAndLostItemUserId(
            Long foundItemId,
            Long userId
    );
}