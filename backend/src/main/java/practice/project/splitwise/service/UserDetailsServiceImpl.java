package practice.project.splitwise.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import practice.project.splitwise.model.Users;
import practice.project.splitwise.repository.UserRepo;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("UserDetailsService.loadUserByUsername called with email: " + email); // Debug log
        
        Users user = userRepo.findByMail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        System.out.println("User found in UserDetailsService: " + user); // Debug log
        
        return User.builder()
                .username(user.getMail())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }
} 