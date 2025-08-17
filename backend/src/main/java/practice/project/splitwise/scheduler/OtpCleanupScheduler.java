//package practice.project.splitwise.scheduler;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.scheduling.annotation.EnableScheduling;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Component;
//import practice.project.splitwise.service.OtpService;
//
//@Component
//@EnableScheduling
//public class OtpCleanupScheduler {
//
//    @Autowired
//    private OtpService otpService;
//
//    // Run every hour to cleanup expired OTPs
//    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 ms
//    public void cleanupExpiredOtps() {
//        try {
//            otpService.cleanupExpiredOtps();
//        } catch (Exception e) {
//            System.err.println("Failed to cleanup expired OTPs: " + e.getMessage());
//        }
//    }
//}