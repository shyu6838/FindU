package findu.backend.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.auth.dto.RefreshTokenRequest;
import findu.backend.auth.dto.TokenResponse;
import findu.backend.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "인증", description = "JWT 토큰 재발급과 로그아웃 API")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/reissue")
    @Operation(summary = "액세스 토큰 재발급", description = "refreshToken으로 새 accessToken과 refreshToken을 발급합니다.")
    @SecurityRequirements
    public TokenResponse reissue(
            @RequestBody RefreshTokenRequest request
    ) {
        return authService.reissue(
                request.getRefreshToken()
        );
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃", description = "현재 사용자의 refresh token을 만료 처리합니다.")
    public void logout(
            @AuthenticationPrincipal Long userId
    ) {
        authService.logout(userId);
    }
}
