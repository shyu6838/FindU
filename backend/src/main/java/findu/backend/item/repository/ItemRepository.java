package findu.backend.item.repository;

import findu.backend.item.entity.Item;
import findu.backend.item.entity.ItemStatus;
import findu.backend.item.entity.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Item i where i.id = :id")
    Optional<Item> lockById(@Param("id") Long id);

    // 유형별(LOST/FOUND) 최신순 목록 조회
    List<Item> findByTypeOrderByCreatedAtDesc(ItemType type);
    
    // 전체 최신순 목록 조회
    List<Item> findAllByOrderByCreatedAtDesc();

    List<Item> findByTypeAndStatusOrderByCreatedAtDesc(ItemType type, ItemStatus status);
}
