package findu.backend.image.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "이미지", description = "S3 이미지 업로드와 삭제 API")
public class ImageController {

    private final S3Service s3Service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "이미지 업로드", description = "이미지 파일을 S3에 저장하고 접근 가능한 imageUrl을 반환합니다.")
    public ImageUploadResponseDto uploadImage(
            @Parameter(description = "업로드할 이미지 파일", required = true)
            @RequestParam("file") MultipartFile file
    ) {

        String imageUrl = s3Service.upload(file);

        return ImageUploadResponseDto.builder()
                .imageUrl(imageUrl)
                .build();
    }
    @DeleteMapping
    @Operation(summary = "이미지 삭제", description = "imageUrl에 해당하는 S3 이미지를 삭제합니다.")
    public ResponseEntity<Void> deleteImage(
            @RequestParam("imageUrl") String imageUrl
    ) {
        s3Service.delete(imageUrl);

        return ResponseEntity.noContent().build();
    }
}
