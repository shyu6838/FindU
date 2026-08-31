package findu.backend.verification.dto; import jakarta.validation.constraints.NotBlank; public record VerificationAnswerRequest(@NotBlank String answer){}
