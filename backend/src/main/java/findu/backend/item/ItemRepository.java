package findu.backend.item;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    // 유형별(LOST/FOUND) 최신순 목록 조회
    List<Item> findByTypeOrderByCreatedAtDesc(ItemType type);
    
    // 전체 최신순 목록 조회
    List<Item> findAllByOrderByCreatedAtDesc();
}