package findu.backend.chat.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // 서버 → 클라이언트
        config.enableSimpleBroker("/sub", "/queue");

        // 로그인한 사용자만 자신의 알림 채널을 구독할 수 있도록 사용한다.
        config.setUserDestinationPrefix("/user");

        // 클라이언트 → 서버
        config.setApplicationDestinationPrefixes("/pub");
    }

    @Override
    public void registerStompEndpoints(
            StompEndpointRegistry registry
    ) {

        registry
                .addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureClientInboundChannel(
            ChannelRegistration registration
    ) {

        registration.interceptors(
                webSocketAuthInterceptor
        );
    }
}
