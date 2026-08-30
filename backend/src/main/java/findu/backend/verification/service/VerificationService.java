package findu.backend.verification.service;

import findu.backend.founditem.entity.FoundItem;
import findu.backend.founditem.repository.FoundItemRepository;
import findu.backend.match.entity.ItemMatch;
import findu.backend.match.repository.ItemMatchRepository;
import findu.backend.verification.dto.*;
import findu.backend.verification.entity.VerificationQuestion;
import findu.backend.verification.repository.VerificationQuestionRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final VerificationQuestionRepository repo;
    private final FoundItemRepository found;
    private final ItemMatchRepository itemMatchRepository;
    private final PasswordEncoder encoder;

    /**
     * 습득물 등록자가 인증 질문 생성
     */
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

        // 습득물 등록자만 질문 생성 가능
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

    /**
     * 특정 습득물의 인증 질문 조회
     *
     * 정답(answerHash)은 Response에 포함하지 않음
     */
    @Transactional(readOnly = true)
    public List<VerificationQuestionResponse> list(Long foundId) {

        return repo.findByFoundItemId(foundId)
                .stream()
                .map(VerificationQuestionResponse::from)
                .toList();
    }

    /**
     * 인증 질문 답변
     *
     * 해당 습득물과 매칭된 분실물의 소유자만 인증 가능
     */
    @Transactional(readOnly = true)
    public boolean verify(
            Long uid,
            Long questionId,
            VerificationAnswerRequest r
    ) {

        VerificationQuestion question = repo.findById(questionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "인증 질문을 찾을 수 없습니다."
                        )
                );

        Long foundItemId =
                question.getFoundItem().getId();

        // 현재 사용자가 해당 습득물과 매칭된 분실물의 주인인지 확인
        boolean matchedOwner =
                itemMatchRepository
                        .existsByFoundItemIdAndLostItemUserId(
                                foundItemId,
                                uid
                        );

        if (!matchedOwner) {
            throw new IllegalStateException(
                    "해당 습득물과 매칭된 분실물의 사용자만 인증할 수 있습니다."
            );
        }

        return encoder.matches(
                r.answer(),
                question.getAnswerHash()
        );
    }
}