package findu.backend.security.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI finduOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("FindU Backend API")
                        .version("v1")
                        .description("""
                                FindU 분실물·습득물 서비스 API입니다.

                                인증이 필요한 요청은 Swagger 상단 **Authorize**에 JWT access token을 입력하세요.

                                ### 실시간 WebSocket
                                - 연결: `wss://api.findu-team.com/ws/chat`
                                - STOMP CONNECT 헤더: `Authorization: Bearer {accessToken}`
                                - 메시지 발행: `/pub/chat/{roomId}`
                                - 채팅 구독: `/sub/chat/{roomId}`
                                - 개인 알림 구독: `/user/queue/notifications`
                                """))
                .components(new Components().addSecuritySchemes(
                        "bearerAuth",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Google 로그인 후 발급된 accessToken을 입력합니다.")
                ))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
