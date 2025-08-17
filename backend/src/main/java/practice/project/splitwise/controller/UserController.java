package practice.project.splitwise.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import practice.project.splitwise.dto.UserResponseDTO;
import practice.project.splitwise.model.Users;
import practice.project.splitwise.repository.UserRepo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    @Autowired
    private UserRepo userRepo;

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<Users> users = userRepo.findAll();
        List<UserResponseDTO> userDTOs = users.stream()
                .map(user -> new UserResponseDTO(user.getId(), user.getName(), user.getMail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Integer id) {
        Optional<Users> user = userRepo.findById(id);
        if (user.isPresent()) {
            Users u = user.get();
            return ResponseEntity.ok(new UserResponseDTO(u.getId(), u.getName(), u.getMail()));
        }
        return ResponseEntity.status(404).build();
    }

    @PostMapping
    @Operation(summary = "Create new user")
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody Users user) {
        // This endpoint should be protected or removed in favor of /api/auth/register
        return ResponseEntity.status(403).build();
    }
}