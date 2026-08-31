package findu.backend.notification.entity;

import findu.backend.global.entity.BaseEntity;
import findu.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "notifications")
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    User user;

    @Column(nullable = false, length = 30)
    String type;

    @Column(nullable = false, length = 500)
    String message;

    // 채팅 알림을 누르면 기존 대화로 이동할 수 있도록 채팅방 ID를 저장한다.
    Long targetId;

    @Builder.Default
    @Column(nullable = false)
    boolean read = false;

    public void markRead() {
        read = true;
    }
}
