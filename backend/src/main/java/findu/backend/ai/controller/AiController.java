package findu.backend.ai.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.ai.client.AiClient;
import findu.backend.ai.dto.AiHealthResponse;
import findu.backend.ai.dto.AiImageEmbeddingResponse;
import findu.backend.ai.dto.AiTextEmbeddingRequest;
import findu.backend.ai.dto.AiTextEmbeddingResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
@Tag(name = "AI", description = "AI 서버 상태와 OpenCLIP 512차원 임베딩 생성 API")
public class AiController {

    private final AiClient aiClient;

    @GetMapping("/health")
    @Operation(summary = "AI 서버 상태 확인", description = "AI 서버의 실행 상태와 벡터 차원을 확인합니다.")
    @SecurityRequirements
    public AiHealthResponse health() {
        return aiClient.health();
    }

    @PostMapping("/embedding/text")
    @Operation(summary = "텍스트 임베딩 생성", description = "검색어를 AI 서버로 전달하여 512차원 텍스트 벡터를 반환합니다.")
    public AiTextEmbeddingResponse embedText(@Valid @RequestBody AiTextEmbeddingRequest request) {
        return aiClient.embedText(request.text());
    }

    @PostMapping(value = "/embedding/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "이미지 임베딩 생성", description = "이미지 파일을 AI 서버로 전달하여 512차원 이미지 벡터를 반환합니다.")
    public AiImageEmbeddingResponse embedImage(
            @Parameter(description = "임베딩할 이미지 파일", required = true)
            @RequestParam MultipartFile file
    ) {
        return aiClient.embedImage(file);
    }
}
