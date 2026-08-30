package findu.backend.auth.service;

import findu.backend.auth.dto.TokenResponse;
import findu.backend.auth.entity.RefreshToken;
import findu.backend.auth.repository.RefreshTokenRepository;
import findu.backend.security.jwt.JwtTokenProvider;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public TokenResponse issueTokens(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );

        String accessToken =
                jwtTokenProvider.createAccessToken(
                        user.getId(),
                        user.getEmail()
                );

        String refreshToken =
                jwtTokenProvider.createRefreshToken(
                        user.getId()
                );

        LocalDateTime expiresAt =
                LocalDateTime.now()
                        .plusSeconds(
                                jwtTokenProvider
                                        .getRefreshTokenExpiration()
                                        / 1000
                        );

        RefreshToken savedToken =
                refreshTokenRepository
                        .findByUser(user)
                        .orElseGet(() ->
                                RefreshToken.builder()
                                        .user(user)
                                        .token(refreshToken)
                                        .expiresAt(expiresAt)
                                        .build()
                        );

        savedToken.updateToken(
                refreshToken,
                expiresAt
        );

        refreshTokenRepository.save(savedToken);

        return new TokenResponse(
                accessToken,
                refreshToken
        );
    }

    @Transactional
    public TokenResponse reissue(
            String refreshToken
    ) {

        if (refreshToken == null ||
                refreshToken.isBlank()) {

            throw new IllegalArgumentException(
                    "Refresh Token이 필요합니다."
            );
        }

        if (!jwtTokenProvider.validateToken(
                refreshToken
        )) {

            throw new IllegalArgumentException(
                    "유효하지 않은 Refresh Token입니다."
            );
        }

        RefreshToken savedToken =
                refreshTokenRepository
                        .findByToken(refreshToken)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "존재하지 않는 Refresh Token입니다."
                                )
                        );

        if (savedToken.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            refreshTokenRepository.delete(savedToken);

            throw new IllegalArgumentException(
                    "Refresh Token이 만료되었습니다."
            );
        }

        Long userId =
                jwtTokenProvider.getUserId(
                        refreshToken
                );

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "사용자를 찾을 수 없습니다."
                                )
                        );

        String newAccessToken =
                jwtTokenProvider.createAccessToken(
                        user.getId(),
                        user.getEmail()
                );

        String newRefreshToken =
                jwtTokenProvider.createRefreshToken(
                        user.getId()
                );

        LocalDateTime newExpiresAt =
                LocalDateTime.now()
                        .plusSeconds(
                                jwtTokenProvider
                                        .getRefreshTokenExpiration()
                                        / 1000
                        );

        savedToken.updateToken(
                newRefreshToken,
                newExpiresAt
        );

        return new TokenResponse(
                newAccessToken,
                newRefreshToken
        );
    }

    @Transactional
    public void logout(Long userId) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "사용자를 찾을 수 없습니다."
                                )
                        );

        refreshTokenRepository.deleteByUser(user);
    }
}