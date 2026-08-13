package findu.backend.auth.handler;

import findu.backend.security.jwt.JwtTokenProvider;
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

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();

        String email =
                oauthUser.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalStateException("사용자를 찾을 수 없습니다.")
                );

        String accessToken =
                jwtTokenProvider.createAccessToken(
                        user.getId(),
                        user.getEmail()
                );

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                """
                {
                    "accessToken": "%s",
                    "userId": %d,
                    "email": "%s"
                }
                """.formatted(
                        accessToken,
                        user.getId(),
                        user.getEmail()
                )
        );
    }
}