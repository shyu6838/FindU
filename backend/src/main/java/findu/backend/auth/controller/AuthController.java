package findu.backend.auth.controller;

import findu.backend.auth.dto.RefreshTokenRequest;
import findu.backend.auth.dto.TokenResponse;
import findu.backend.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/reissue")
    public TokenResponse reissue(
            @RequestBody RefreshTokenRequest request
    ) {
        return authService.reissue(
                request.getRefreshToken()
        );
    }

    @PostMapping("/logout")
    public void logout(
            @AuthenticationPrincipal Long userId
    ) {
        authService.logout(userId);
    }
}