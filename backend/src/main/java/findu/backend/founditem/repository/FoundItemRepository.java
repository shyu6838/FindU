package findu.backend.founditem.repository;

import findu.backend.founditem.entity.FoundItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface FoundItemRepository
        extends JpaRepository<FoundItem, Long> {

    List<FoundItem> findAllByOrderByCreatedAtDesc();

    // 제목, 설명, 장소 중 하나라도 키워드를 포함하는 습득물 검색
    List<FoundItem>
    findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrLocationContainingIgnoreCaseOrderByCreatedAtDesc(
            String title,
            String description,
            String location
    );
}