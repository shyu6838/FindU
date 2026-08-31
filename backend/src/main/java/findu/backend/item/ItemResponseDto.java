package findu.backend.item;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ItemResponseDto {
    private Long id;
    private ItemType type;
    private String title;
    private String content;
    private String location;
    private LocalDateTime eventDate;
    private String imageUrl;
    private String question;
    private String answer;
    private ItemStatus status;
    private Long categoryId;
    private String categoryName;
    private Long writerId;
    private String writerEmail;
    private LocalDateTime createdAt;

    public static ItemResponseDto from(Item item) {
        return ItemResponseDto.builder()
                .id(item.getId())
                .type(item.getType())
                .title(item.getTitle())
                .content(item.getContent())
                .location(item.getLocation())
                .eventDate(item.getEventDate())
                .imageUrl(item.getImageUrl())
                .question(item.getQuestion())
                .answer(item.getAnswer())
                .status(item.getStatus())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .writerId(item.getUser() != null ? item.getUser().getId() : null)
                .writerEmail(item.getUser() != null ? item.getUser().getEmail() : null) 
                .createdAt(item.getCreatedAt())
                .build();
    }
}
