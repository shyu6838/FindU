package findu.backend.lostitem.entity;

import findu.backend.category.entity.Category;
import findu.backend.global.entity.BaseEntity;
import findu.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Getter @Builder @NoArgsConstructor(access=AccessLevel.PROTECTED) @AllArgsConstructor
@Table(name="lost_items")
public class LostItem extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") private User user;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="category_id") private Category category;
 @Column(nullable=false,length=100) private String title;
 @Column(nullable=false,columnDefinition="TEXT") private String description;
 @Column(length=1000) private String imageUrl;
 @Column(length=255) private String location;
 @Column(nullable=false) private LocalDateTime lostAt;
 public void update(Category category,String title,String description,String imageUrl,String location,LocalDateTime lostAt){this.category=category;this.title=title;this.description=description;this.imageUrl=imageUrl;this.location=location;this.lostAt=lostAt;}
}
