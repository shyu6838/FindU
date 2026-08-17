package findu.backend.image.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import java.net.URI;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${AWS_REGION}")
    private String region;

    public String upload(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어있습니다.");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null) {
            throw new IllegalArgumentException("파일명이 없습니다.");
        }

        String extension = "";

        int dotIndex = originalFilename.lastIndexOf(".");

        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String fileName =
                "images/" + UUID.randomUUID() + extension;

        try {
            PutObjectRequest request =
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(fileName)
                            .contentType(file.getContentType())
                            .build();

            s3Client.putObject(
                    request,
                    RequestBody.fromBytes(file.getBytes())
            );

            return "https://" + bucket
                    + ".s3." + region
                    + ".amazonaws.com/"
                    + fileName;

        } catch (IOException e) {
            throw new IllegalStateException(
                    "이미지 업로드에 실패했습니다.",
                    e
            );
        }
    }
    public void delete(String imageUrl) {

        try {
            URI uri = URI.create(imageUrl);

            String key = uri.getPath().substring(1);

            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .build()
            );

        } catch (Exception e) {
            throw new IllegalStateException(
                    "이미지 삭제에 실패했습니다.",
                    e
            );
        }
    }
}