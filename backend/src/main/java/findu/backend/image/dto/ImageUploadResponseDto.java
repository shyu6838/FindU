package findu.backend.image.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ImageUploadResponseDto {

    private String imageUrl;
}