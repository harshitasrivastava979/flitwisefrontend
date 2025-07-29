package practice.project.splitwise.service.initilazation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import practice.project.splitwise.model.Users;
import practice.project.splitwise.repository.UserRepo;

@Service
public class InitServiceImpl implements InitService {

    @Autowired
    private UserRepo userRepo;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void initialise() {
        System.out.println("Initializing application data..."); // Debug log
        
        // Check if test user exists, if not create one
        if (!userRepo.findByMail("test@example.com").isPresent()) {
            System.out.println("Creating test user..."); // Debug log
            
            Users testUser = new Users();
            testUser.setName("Test User");
            testUser.setMail("test@example.com");
            testUser.setPassword(passwordEncoder.encode("password123"));
            
            Users savedUser = userRepo.save(testUser);
            System.out.println("Test user created: " + savedUser); // Debug log
        } else {
            System.out.println("Test user already exists"); // Debug log
        }
        
        // Check if any users exist
        long userCount = userRepo.count();
        System.out.println("Total users in database: " + userCount); // Debug log
        
        if (userCount == 0) {
            System.out.println("No users found in database!"); // Debug log
        } else {
            System.out.println("Users found in database"); // Debug log
            userRepo.findAll().forEach(user -> {
                System.out.println("User: " + user.getName() + " (" + user.getMail() + ")");
            });
        }
    }
}
