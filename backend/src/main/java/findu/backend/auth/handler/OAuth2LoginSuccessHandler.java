package findu.backend.auth.handler;

import findu.backend.security.jwt.JwtTokenProvider;
import findu.backend.user.entity.Role;
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

// OAuth2 로그인 성공 시 사용자 정보를 처리하고 토큰을 발급하여 프론트엔드로 리다이렉트하는 핸들러
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    
    // AuthService 대신 JwtTokenProvider를 직접 주입받아 사용합니다.
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        // 인증 객체에서 사용자 정보 추출
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        if (email == null) {
            throw new IllegalStateException("구글 계정에서 이메일 정보를 가져올 수 없습니다.");
        }

        // 닉네임 생성 (이름이 없을 경우 이메일 앞자리 사용)
        String nickname = (name != null && !name.isBlank()) ? name : email.split("@")[0];

        // 사용자 조회 및 신규 가입 처리
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .nickname(nickname)
                                .profileImage(picture)
                                .trustScore(36)
                                .role(Role.USER)
                                .build()
                ));

        // JWT 토큰 직접 생성 (Access Token 및 Refresh Token)
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        // 프론트엔드 콜백 URL 생성 및 리다이렉트
        String redirectUrl = frontendUrl + "/auth/callback"
                + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8)
                + "&userId=" + user.getId()
                + "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}