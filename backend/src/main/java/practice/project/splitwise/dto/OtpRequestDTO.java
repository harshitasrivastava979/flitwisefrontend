package practice.project.splitwise.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// DTO for OTP generation request
public class OtpRequestDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP type is required")
    private String otpType; // SIGNUP, LOGIN, FORGOT_PASSWORD

    // Constructors
    public OtpRequestDTO() {}

    public OtpRequestDTO(String email, String otpType) {
        this.email = email;
        this.otpType = otpType;
    }

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtpType() { return otpType; }
    public void setOtpType(String otpType) { this.otpType = otpType; }
}

