package findu.backend.verification.dto; import jakarta.validation.constraints.NotBlank; public record VerificationQuestionCreate(@NotBlank String question, @NotBlank String answer){}
