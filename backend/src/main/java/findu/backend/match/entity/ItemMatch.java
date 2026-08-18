package findu.backend.match.entity;

import findu.backend.founditem.entity.FoundItem;
import findu.backend.global.entity.BaseEntity;
import findu.backend.lostitem.entity.LostItem;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "item_matches")
public class ItemMatch extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lost_item_id")
    private LostItem lostItem;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "found_item_id")
    private FoundItem foundItem;

    @Column(nullable = false)
    private Double imageScore;

    @Column(nullable = false)
    private Double textScore;

    @Column(nullable = false)
    private Double locationScore;

    @Column(nullable = false)
    private Double timeScore;

    @Column(nullable = false)
    private Double finalScore;
}