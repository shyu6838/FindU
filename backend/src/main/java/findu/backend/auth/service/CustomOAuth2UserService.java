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

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {

        OAuth2User oauthUser = super.loadUser(userRequest);

        GoogleUserInfo userInfo =
                new GoogleUserInfo(oauthUser.getAttributes());

        User user = userRepository.findByEmail(userInfo.getEmail())
                .orElseGet(() ->
                        userRepository.save(
                                User.builder()
                                        .email(userInfo.getEmail())
                                        .nickname(userInfo.getNickname())
                                        .profileImage(userInfo.getProfileImage())
                                        .trustScore(0)
                                        .role(Role.USER)
                                        .build()
                        )
                );

        return oauthUser;
    }
}