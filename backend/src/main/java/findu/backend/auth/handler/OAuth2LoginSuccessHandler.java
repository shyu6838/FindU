package findu.backend.auth.handler;

import findu.backend.auth.dto.TokenResponse;
import findu.backend.auth.service.AuthService;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;

    private final AuthService authService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        /*
         * Google에서 인증된 사용자 정보 가져오기
         */
        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();

        String email =
                oauthUser.getAttribute("email");

        /*
         * DB에서 사용자 조회
         */
        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "사용자를 찾을 수 없습니다."
                                )
                        );

        /*
         * JWT 발급
         */
        TokenResponse tokens =
                authService.issueTokens(
                        user.getId()
                );

        /*
         * React OAuth Callback 주소 생성
         *
         * 예:
         *
         * http://localhost:5173/auth/callback
         * ?accessToken=...
         * &refreshToken=...
         * &userId=1
         * &email=...
         */
        String redirectUrl =
                frontendUrl
                        + "/auth/callback"
                        + "?accessToken="
                        + URLEncoder.encode(
                        tokens.getAccessToken(),
                        StandardCharsets.UTF_8
                )
                        + "&refreshToken="
                        + URLEncoder.encode(
                        tokens.getRefreshToken(),
                        StandardCharsets.UTF_8
                )
                        + "&userId="
                        + user.getId()
                        + "&email="
                        + URLEncoder.encode(
                        user.getEmail(),
                        StandardCharsets.UTF_8
                );
        System.out.println("OAuth redirectUrl = " + redirectUrl);
        getRedirectStrategy().sendRedirect(
                request,
                response,
                redirectUrl
        );
    }
}