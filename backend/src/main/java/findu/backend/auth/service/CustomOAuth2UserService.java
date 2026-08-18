// CustomOAuth2UserService.java

package findu.backend.auth.service;

import findu.backend.auth.info.GoogleUserInfo;
import findu.backend.user.entity.Role;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// OAuth2 제공자로부터 사용자 정보를 로드하고 DB에 저장하는 서비스
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {

        // 1. OAuth2 제공자로부터 사용자 정보 로드
        OAuth2User oauthUser = super.loadUser(userRequest);
        GoogleUserInfo userInfo = new GoogleUserInfo(oauthUser.getAttributes());

        String email = userInfo.getEmail();
        String nickname = userInfo.getNickname();

        if (nickname == null || nickname.isBlank()) {
            nickname = (email != null) ? email.split("@")[0] : "사용자";
        }

        final String finalNickname = nickname;

        // 2. 신규 사용자일 경우 DB에 정보 저장
        userRepository.findByEmail(email)
                .orElseGet(() ->
                        userRepository.save(
                                User.builder()
                                        .email(email)
                                        .nickname(finalNickname)
                                        .profileImage(userInfo.getProfileImage())
                                        .trustScore(36)
                                        .role(Role.USER)
                                        .build()
                        )
                );

        return oauthUser;
    }
}