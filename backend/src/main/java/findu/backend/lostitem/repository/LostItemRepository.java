package findu.backend.lostitem.repository;
import findu.backend.lostitem.entity.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface LostItemRepository extends JpaRepository<LostItem,Long>{ List<LostItem> findAllByOrderByCreatedAtDesc(); List<LostItem> findByUserIdOrderByCreatedAtDesc(Long userId); }
