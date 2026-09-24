package findu.backend.notification.repository;

import findu.backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

<<<<<<< HEAD
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long id);
    List<Notification> findByUserIdAndReadFalse(Long id);
    void deleteAllByUserId(Long id);
}
=======
import java.util.*;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long id);

    List<Notification> findByUserIdAndReadFalse(Long id);
}
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
