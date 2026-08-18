package findu.backend.item;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class ItemRequestDto {
    private ItemType type;           
    private String title;            
    private String content;          
    private String location;         
    private LocalDateTime eventDate; 
    private String imageUrl;         
    private String question;         
    private String answer;         
    private Long categoryId;         
}