package findu.backend.verification.service;

import findu.backend.founditem.entity.FoundItem;
import findu.backend.founditem.repository.FoundItemRepository;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import findu.backend.verification.dto.*;
import findu.backend.verification.entity.VerificationQuestion;
import findu.backend.verification.entity.VerificationVerification;
import findu.backend.verification.repository.VerificationQuestionRepository;
import findu.backend.verification.repository.VerificationVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationQuestionRepository repo;
    private final VerificationVerificationRepository verificationRepo;
    private final FoundItemRepository found;
    private final UserRepository users;
    private final PasswordEncoder encoder;

    // 인증 질문 생성
    @Transactional
    public VerificationQuestionResponse create(
            Long uid,
            Long foundId,
            VerificationQuestionCreate r
    ) {

        FoundItem f = found.findById(foundId)
                .orElseThrow(() ->
                        new IllegalArgumentException("습득물을 찾을 수 없습니다.")
                );

        if (!f.getUser().getId().equals(uid)) {
            throw new IllegalStateException(
                    "본인의 습득물에만 질문을 등록할 수 있습니다."
            );
        }

        VerificationQuestion question =
                VerificationQuestion.builder()
                        .foundItem(f)
                        .question(r.question())
                        .answerHash(encoder.encode(r.answer()))
                        .build();

        return VerificationQuestionResponse.from(
                repo.save(question)
        );
    }

    // 질문 조회
    @Transactional(readOnly = true)
    public List<VerificationQuestionResponse> list(Long foundId) {

        return repo.findByFoundItemId(foundId)
                .stream()
                .map(VerificationQuestionResponse::from)
                .toList();
    }

    // 답변 검증
    @Transactional
    public boolean verify(
            Long uid,
            Long questionId,
            VerificationAnswerRequest r
    ) {

        VerificationQuestion question =
                repo.findById(questionId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "인증 질문을 찾을 수 없습니다."
                                )
                        );

        boolean correct =
                encoder.matches(
                        r.answer(),
                        question.getAnswerHash()
                );

        // 오답
        if (!correct) {
            return false;
        }

        FoundItem foundItem = question.getFoundItem();

        User user = users.findById(uid)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );

        // 이미 인증한 경우
        if (!verificationRepo.existsByUserIdAndFoundItemId(
                uid,
                foundItem.getId()
        )) {

            VerificationVerification verification =
                    VerificationVerification.builder()
                            .user(user)
                            .foundItem(foundItem)
                            .build();

            verificationRepo.save(verification);
        }

        return true;
    }

    // 특정 사용자가 해당 습득물의 인증을 통과했는지 확인
    @Transactional(readOnly = true)
    public boolean isVerified(
            Long uid,
            Long foundItemId
    ) {

        return verificationRepo.existsByUserIdAndFoundItemId(
                uid,
                foundItemId
        );
    }
}