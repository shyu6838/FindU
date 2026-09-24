<<<<<<< HEAD:backend/src/main/java/findu/backend/item/Item.java
package findu.backend.item;
=======
// Item.java

package findu.backend.item.entitiy;
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6:backend/src/main/java/findu/backend/item/entitiy/Item.java

import findu.backend.category.entity.Category;
import findu.backend.chat.entity.ChatRoom;
import findu.backend.global.entity.BaseEntity;
import findu.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Builder.Default
    @OneToMany(mappedBy = "item", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<ChatRoom> chatRooms = new ArrayList<>();

    public void updateStatus(ItemStatus status) {
        this.status = status;
    }

    public void update(String title, String content, String location, LocalDateTime eventDate, String imageUrl, String question, String answer, Category category) {
        this.title = title;
        this.content = content;
        this.location = location;
        this.eventDate = eventDate;
        this.imageUrl = imageUrl;
        this.question = question;
        this.answer = answer;
        this.category = category;
    }
}