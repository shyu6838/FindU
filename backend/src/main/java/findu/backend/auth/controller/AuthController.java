package findu.backend.auth.controller;

import findu.backend.auth.dto.RefreshTokenRequest;
import findu.backend.auth.dto.TokenResponse;
import findu.backend.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/reissue")
    public ResponseEntity<TokenResponse> reissue(
            @RequestBody RefreshTokenRequest request
    ) {

        return ResponseEntity.ok(
                authService.reissue(
                        request.getRefreshToken()
                )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @AuthenticationPrincipal Long userId
    ) {

        authService.logout(userId);

        return ResponseEntity.noContent().build();
    }
}