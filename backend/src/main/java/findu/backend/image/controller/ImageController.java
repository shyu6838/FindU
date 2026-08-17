package findu.backend.image.controller;

import findu.backend.image.dto.ImageUploadResponseDto;
import findu.backend.image.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class ImageController {

    private final S3Service s3Service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImageUploadResponseDto uploadImage(
            @RequestParam("file") MultipartFile file
    ) {

        String imageUrl = s3Service.upload(file);

        return ImageUploadResponseDto.builder()
                .imageUrl(imageUrl)
                .build();
    }
    @DeleteMapping
    public ResponseEntity<Void> deleteImage(
            @RequestParam("imageUrl") String imageUrl
    ) {
        s3Service.delete(imageUrl);

        return ResponseEntity.noContent().build();
    }
}