// OAuth2LoginSuccessHandler.java

package findu.backend.auth.handler;

import findu.backend.security.jwt.JwtTokenProvider;
import findu.backend.user.entity.Role;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

// OAuth2 로그인 성공 시 JWT 토큰을 발급하고 프론트엔드로 리다이렉트하는 핸들러
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        // 1. 인증 객체에서 구글 계정 정보 추출
        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");

        if (email == null) {
            throw new IllegalStateException("구글 계정에서 이메일 정보를 가져올 수 없습니다.");
        }

        String nickname = (name != null && !name.isBlank()) ? name : email.split("@")[0];

        // 2. 기존 사용자 조회 또는 신규 가입 처리
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

        // 3. JWT 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getEmail());

        // 4. 토큰을 포함하여 프론트엔드 콜백 URL로 리다이렉트
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth/callback")
                .queryParam("token", accessToken)
                .queryParam("userId", user.getId())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}