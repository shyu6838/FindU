package findu.backend.report.entity;

import findu.backend.global.entity.BaseEntity;
import findu.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "reports")
public class Report extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @Column(nullable = false, length = 30)
    private String targetType;

    @Column(nullable = false)
    private Long targetId;

    @Column(nullable = false, length = 100)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(length = 100)
    private String penaltyDetails;

    @Column(length = 200)
    private String snapshotTitle;

    @Column(length = 500)
    private String snapshotImageUrl;

    @Column(length = 30)
    private String snapshotItemType;

    @Column(columnDefinition = "TEXT")
    private String snapshotChatLogs;

    @Column(length = 50)
    private String snapshotTargetNickname;

    @Column(length = 100)
    private String snapshotTargetEmail;

    public enum Status {
        PENDING,
        RESOLVED,
        REJECTED
    }

    public void updateStatus(Status status, String penaltyDetails) {
        this.status = status;
        this.penaltyDetails = penaltyDetails;
    }

    public void setSnapshot(String title, String imageUrl, String itemType) {
        this.snapshotTitle = title;
        this.snapshotImageUrl = imageUrl;
        this.snapshotItemType = itemType;
    }

    public void setChatSnapshot(String chatLogs) {
        this.snapshotChatLogs = chatLogs;
    }

    public void setChatUserInfoSnapshot(String nickname, String email) {
        this.snapshotTargetNickname = nickname;
        this.snapshotTargetEmail = email;
    }
}