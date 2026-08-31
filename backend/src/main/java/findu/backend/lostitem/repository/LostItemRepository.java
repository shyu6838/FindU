package findu.backend.lostitem.repository;

import findu.backend.lostitem.entity.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LostItemRepository
        extends JpaRepository<LostItem, Long> {

    List<LostItem> findAllByOrderByCreatedAtDesc();

    List<LostItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 제목, 설명, 장소 중 하나라도 키워드를 포함하는 분실물 검색
    List<LostItem>
    findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrLocationContainingIgnoreCaseOrderByCreatedAtDesc(
            String title,
            String description,
            String location
    );
}