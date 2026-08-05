package findu.backend.user.service;

import findu.backend.user.dto.UserResponseDto;
import findu.backend.user.dto.UserUpdateRequestDto;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponseDto getUser(Long id){

        User user = userRepository.findById(id)
                .orElseThrow();

        return UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .trustScore(user.getTrustScore())
                .build();
    }

}