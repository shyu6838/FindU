// Item.java

package findu.backend.item;

import findu.backend.category.entity.Category;
import findu.backend.global.entity.BaseEntity;
import findu.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// 분실 및 습득 게시물 정보를 관리하는 엔티티
@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "items")
public class Item extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type; 

    @Column(nullable = false)
    private String title; 

    @Column(columnDefinition = "TEXT")
    private String content; 

    private String location; 

    private LocalDateTime eventDate; 

    private String imageUrl; 

    private String question; 
    private String answer;   

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemStatus status; 

    // 카테고리 연관관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // 작성자 연관관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 게시물 상태 업데이트
    public void updateStatus(ItemStatus status) {
        this.status = status;
    }

    // 게시물 정보 수정
    public void update(String title, String content, String location, LocalDateTime eventDate, String question, String answer, Category category) {
        this.title = title;
        this.content = content;
        this.location = location;
        this.eventDate = eventDate;
        this.question = question;
        this.answer = answer;
        this.category = category;
    }
}