package findu.backend.user.service;

import findu.backend.user.dto.UserResponseDto;
import findu.backend.user.dto.UserUpdateRequestDto;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * 내 정보 조회
     */
    @Transactional(readOnly = true)
    public UserResponseDto getUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다.")
                );

        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .trustScore(user.getTrustScore())
                .build();
    }

    /**
     * 내 정보 수정
     */
    @Transactional
    public UserResponseDto updateMyInfo(
            Long userId,
            UserUpdateRequestDto request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다.")
                );

        // 닉네임 수정
        if (request.getNickname() != null) {
            user.updateNickname(request.getNickname());
        }

        // 프로필 이미지 수정
        if (request.getProfileImage() != null) {
            user.updateProfileImage(request.getProfileImage());
        }

        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .trustScore(user.getTrustScore())
                .build();
    }
}