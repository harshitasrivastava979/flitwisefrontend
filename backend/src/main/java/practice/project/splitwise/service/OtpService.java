package practice.project.splitwise.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import practice.project.splitwise.model.UserOtp;
import practice.project.splitwise.model.UserOtp.OtpType;
import practice.project.splitwise.model.Users;
import practice.project.splitwise.repository.UserOtpRepository;
import practice.project.splitwise.repository.UserRepo;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    @Autowired
    private UserOtpRepository otpRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Value("${app.otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    @Value("${app.otp.max-attempts:3}")
    private int maxAttempts;

    @Value("${app.otp.lockout-duration-minutes:30}")
    private int lockoutDurationMinutes;

    private final SecureRandom random = new SecureRandom();

    @Transactional
    public void generateAndSendOtp(String email, OtpType otpType) {
        Optional<Users> userOpt = userRepository.findByMail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }

        Users user = userOpt.get();

        // Check if user account is locked
        if (user.isAccountLocked()) {
            throw new RuntimeException("Account is temporarily locked. Please try again later.");
        }

        // Check rate limiting (max 5 OTP requests per hour)
        long recentOtpCount = otpRepository.countOtpAttemptsInLastHour(
                user.getId(), otpType, LocalDateTime.now().minusHours(1));

        if (recentOtpCount >= 5) {
            throw new RuntimeException("Too many OTP requests. Please try again after an hour.");
        }

        // Mark all previous OTPs as used
        otpRepository.markAllOtpAsUsedForUserAndType(user.getId(), otpType);

        // Generate new OTP
        String otpCode = generateOtpCode();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(otpExpiryMinutes);

        UserOtp userOtp = new UserOtp(user.getId(), otpCode, otpType, expiryTime);
        otpRepository.save(userOtp);

        // Send email
        sendOtpEmail(user, otpCode, otpType);
    }

    @Transactional
    public boolean verifyOtp(String email, String otpCode, OtpType otpType) {
        Optional<Users> userOpt = userRepository.findByMail(email);
        if (userOpt.isEmpty()) {
            return false;
        }

        Users user = userOpt.get();

        // Check if account is locked
        if (user.isAccountLocked()) {
            return false;
        }

        // Find valid OTP
        Optional<UserOtp> otpOpt = otpRepository.findValidOtpByUserIdAndType(
                user.getId(), otpType, LocalDateTime.now());

        if (otpOpt.isEmpty()) {
            return false;
        }

        UserOtp userOtp = otpOpt.get();

        // Check if OTP matches
        if (!userOtp.getOtpCode().equals(otpCode)) {
            // Increment attempts
            userOtp.setAttempts(userOtp.getAttempts() + 1);
            otpRepository.save(userOtp);

            // Lock account if max attempts exceeded
            if (userOtp.getAttempts() >= maxAttempts) {
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
                userRepository.save(user);
            }

            return false;
        }

        // Mark OTP as used
        userOtp.setIsUsed(true);
        otpRepository.save(userOtp);

        // Mark email as verified if it's signup OTP
        if (otpType == OtpType.SIGNUP) {
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        return true;
    }

    private String generateOtpCode() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    private void sendOtpEmail(Users user, String otpCode, OtpType otpType) {
        String subject = getEmailSubject(otpType);
        String body = getEmailBody(user.getName(), otpCode, otpType);

        emailService.sendSimpleEmail(user.getMail(), subject, body);
    }

    private String getEmailSubject(OtpType otpType) {
        switch (otpType) {
            case SIGNUP:
                return "Verify Your Email - Splitwise Clone";
            case LOGIN:
                return "Login Verification Code - Splitwise Clone";
            case FORGOT_PASSWORD:
                return "Password Reset Code - Splitwise Clone";
            default:
                return "Verification Code - Splitwise Clone";
        }
    }

    private String getEmailBody(String userName, String otpCode, OtpType otpType) {
        String purpose = "";
        switch (otpType) {
            case SIGNUP:
                purpose = "verify your email address";
                break;
            case LOGIN:
                purpose = "complete your login";
                break;
            case FORGOT_PASSWORD:
                purpose = "reset your password";
                break;
        }

        return String.format(
                "Hi %s,\n\n" +
                        "Your verification code to %s is: %s\n\n" +
                        "This code will expire in %d minutes.\n" +
                        "If you didn't request this code, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "Splitwise Clone Team",
                userName, purpose, otpCode, otpExpiryMinutes
        );
    }

    @Transactional
    public void cleanupExpiredOtps() {
        otpRepository.deleteExpiredOtps(LocalDateTime.now());
    }
}

//package practice.project.splitwise.service;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import practice.project.splitwise.model.UserOtp;
//import practice.project.splitwise.model.UserOtp.OtpType;
//import practice.project.splitwise.model.Users;
//import practice.project.splitwise.repository.UserOtpRepository;
//import practice.project.splitwise.repository.UserRepo;
//
//import java.security.SecureRandom;
//import java.time.LocalDateTime;
//import java.util.Optional;
//
//@Service
//public class OtpService {
//
//    @Autowired
//    private UserOtpRepository otpRepository;
//
//    @Autowired
//    private UserRepo userRepository;
//
//    @Autowired
//    private EmailService emailService;
//
//    @Value("${app.otp.length:6}")
//    private int otpLength;
//
//    @Value("${app.otp.expiry-minutes:5}")
//    private int otpExpiryMinutes;
//
//    @Value("${app.otp.max-attempts:3}")
//    private int maxAttempts;
//
//    @Value("${app.otp.lockout-duration-minutes:30}")
//    private int lockoutDurationMinutes;
//
//    private final SecureRandom random = new SecureRandom();
//
//    @Transactional
//    public void generateAndSendOtp(String email, OtpType otpType) throws Exception {
//        Optional<Users> userOpt = userRepository.findByMail(email);
//        if (userOpt.isEmpty()) {
//            throw new RuntimeException("User not found with email: " + email);
//        }
//
//        Users user = userOpt.get();
//
//        // Check if user account is locked
//        if (user.isAccountLocked()) {
//            throw new RuntimeException("Account is temporarily locked. Please try again later.");
//        }
//
//        // Check rate limiting (max 5 OTP requests per hour)
//        long recentOtpCount = otpRepository.countOtpAttemptsInLastHour(
//                user.getId(), otpType, LocalDateTime.now().minusHours(1));
//
//        if (recentOtpCount >= 5) {
//            throw new RuntimeException("Too many OTP requests. Please try again after an hour.");
//        }
//
//        // Mark all previous OTPs as used
//        otpRepository.markAllOtpAsUsedForUserAndType(user.getId(), otpType);
//
//        // Generate new OTP
//        String otpCode = generateOtpCode();
//        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(otpExpiryMinutes);
//
//        UserOtp userOtp = new UserOtp(user.getId(), otpCode, otpType, expiryTime);
//        otpRepository.save(userOtp);
//
//        // Send email
//        sendOtpEmail(user, otpCode, otpType);
//    }
//
//    @Transactional
//    public boolean verifyOtp(String email, String otpCode, OtpType otpType) {
//        Optional<Users> userOpt = userRepository.findByMail(email);
//        if (userOpt.isEmpty()) {
//            return false;
//        }
//
//        Users user = userOpt.get();
//
//        // Check if account is locked
//        if (user.isAccountLocked()) {
//            return false;
//        }
//
//        // Find valid OTP
//        Optional<UserOtp> otpOpt = otpRepository.findValidOtpByUserIdAndType(
//                user.getId(), otpType, LocalDateTime.now());
//
//        if (otpOpt.isEmpty()) {
//            return false;
//        }
//
//        UserOtp userOtp = otpOpt.get();
//
//        // Check if OTP matches
//        if (!userOtp.getOtpCode().equals(otpCode)) {
//            // Increment attempts
//            userOtp.setAttempts(userOtp.getAttempts() + 1);
//            otpRepository.save(userOtp);
//
//            // Lock account if max attempts exceeded
//            if (userOtp.getAttempts() >= maxAttempts) {
//                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
//                userRepository.save(user);
//            }
//
//            return false;
//        }
//
//        // Mark OTP as used
//        userOtp.setIsUsed(true);
//        otpRepository.save(userOtp);
//
//        // Mark email as verified if it's signup OTP
//        if (otpType == OtpType.SIGNUP) {
//            user.setEmailVerified(true);
//            userRepository.save(user);
//        }
//
//        return true;
//    }
//
//    private String generateOtpCode() {
//        StringBuilder otp = new StringBuilder();
//        for (int i = 0; i < otpLength; i++) {
//            otp.append(random.nextInt(10));
//        }
//        return otp.toString();
//    }
//
//    private void sendOtpEmail(Users user, String otpCode, OtpType otpType) {
//        String subject = getEmailSubject(otpType);
//        String body = getEmailBody(user.getName(), otpCode, otpType);
//
//        try {
//            emailService.sendSimpleEmail(user.getMail(), subject, body);
//        } catch (Exception e) {
//            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
//        }
//    }
//
//    private String getEmailSubject(OtpType otpType) {
//        switch (otpType) {
//            case SIGNUP:
//                return "Verify Your Email - Splitwise Clone";
//            case LOGIN:
//                return "Login Verification Code - Splitwise Clone";
//            case FORGOT_PASSWORD:
//                return "Password Reset Code - Splitwise Clone";
//            default:
//                return "Verification Code - Splitwise Clone";
//        }
//    }
//
//    private String getEmailBody(String userName, String otpCode, OtpType otpType) {
//        String purpose = "";
//        switch (otpType) {
//            case SIGNUP:
//                purpose = "verify your email address";
//                break;
//            case LOGIN:
//                purpose = "complete your login";
//                break;
//            case FORGOT_PASSWORD:
//                purpose = "reset your password";
//                break;
//        }
//
//        return String.format(
//                "Hi %s,\n\n" +
//                        "Your verification code to %s is: %s\n\n" +
//                        "This code will expire in %d minutes.\n" +
//                        "If you didn't request this code, please ignore this email.\n\n" +
//                        "Best regards,\n" +
//                        "Splitwise Clone Team",
//                userName, purpose, otpCode, otpExpiryMinutes
//        );
//    }
//
//    @Transactional
//    public void cleanupExpiredOtps() {
//        otpRepository.deleteExpiredOtps(LocalDateTime.now());
//    }
//}