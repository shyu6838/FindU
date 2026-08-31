package findu.backend.chat.entity;

import findu.backend.global.entity.BaseEntity;
import findu.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "chat_requests")
public class ChatRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id")
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED
    }

    public void accept() {
        status = Status.ACCEPTED;
    }

    public void reject() {
        status = Status.REJECTED;
    }
}