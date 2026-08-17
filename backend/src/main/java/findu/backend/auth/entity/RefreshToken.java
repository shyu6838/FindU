package findu.backend.auth.entity;

import findu.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;

    @Column(nullable = false, length = 1000)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    public void updateToken(
            String token,
            LocalDateTime expiresAt
    ) {
        this.token = token;
        this.expiresAt = expiresAt;
    }
}