package practice.project.splitwise.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import practice.project.splitwise.model.UserOtp;
import practice.project.splitwise.model.UserOtp.OtpType;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserOtpRepository extends JpaRepository<UserOtp, Integer> {

    Optional<UserOtp> findByUserIdAndOtpCodeAndOtpTypeAndIsUsedFalseAndExpiresAtAfter(
            Integer userId, String otpCode, OtpType otpType, LocalDateTime currentTime);

    Optional<UserOtp> findTopByUserIdAndOtpTypeAndIsUsedFalseOrderByCreatedAtDesc(
            Integer userId, OtpType otpType);

    @Query("SELECT COUNT(o) FROM UserOtp o WHERE o.userId = ?1 AND o.otpType = ?2 AND o.createdAt > ?3")
    Long countOtpAttemptsInLastHour(Integer userId, OtpType otpType, LocalDateTime oneHourAgo);

    @Modifying
    @Query("UPDATE UserOtp o SET o.isUsed = true WHERE o.userId = ?1 AND o.otpType = ?2 AND o.isUsed = false")
    void markAllOtpAsUsedForUserAndType(Integer userId, OtpType otpType);

    @Modifying
    @Query("DELETE FROM UserOtp o WHERE o.expiresAt < ?1")
    void deleteExpiredOtps(LocalDateTime currentTime);

    @Query("SELECT o FROM UserOtp o WHERE o.userId = ?1 AND o.otpType = ?2 AND o.isUsed = false AND o.expiresAt > ?3")
    Optional<UserOtp> findValidOtpByUserIdAndType(Integer userId, OtpType otpType, LocalDateTime currentTime);
}