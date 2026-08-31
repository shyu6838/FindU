package findu.backend.verification.entity;

import findu.backend.founditem.entity.FoundItem;
import findu.backend.global.entity.BaseEntity;
import findu.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(
        name = "verification_verifications",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_verification_user_found",
                        columnNames = {"user_id", "found_item_id"}
                )
        }
)
public class VerificationVerification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "found_item_id")
    private FoundItem foundItem;
}