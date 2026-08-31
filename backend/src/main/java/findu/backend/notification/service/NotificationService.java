package findu.backend.notification.service;

import findu.backend.notification.dto.NotificationResponse;
import findu.backend.notification.entity.Notification;
import findu.backend.notification.repository.NotificationRepository;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;
    private final UserRepository users;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(Long uid) {
        return repo.findByUserIdOrderByCreatedAtDesc(uid)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public void read(Long uid, Long id) {
        Notification x = repo.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("알림을 찾을 수 없습니다.")
                );

        if (!x.getUser().getId().equals(uid)) {
            throw new IllegalStateException("본인의 알림만 처리할 수 있습니다.");
        }

        x.markRead();
    }

    @Transactional
    public void readAll(Long uid) {
        repo.findByUserIdAndReadFalse(uid)
                .forEach(Notification::markRead);
    }

    // 알림 생성
    @Transactional
    public void create(Long userId, String type, String message) {
        create(userId, type, message, null);
    }

    @Transactional
    public void create(
            Long userId,
            String type,
            String message,
            Long targetId
    ) {
        User user = users.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다.")
                );

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .targetId(targetId)
                .build();

        Notification savedNotification = repo.save(notification);

        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                NotificationResponse.from(savedNotification)
        );
    }
}
