package practice.project.splitwise.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
public class Users extends BaseModel {

    private String name;
    private String mail;
    private String password;
    // Email verification flag
    private Boolean emailVerified = false;

    // Account lock until timestamp due to excessive OTP failures
    private LocalDateTime accountLockedUntil;
// Added for authentication

    @ManyToMany
    @JoinTable(
            name = "user_group_mapping",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "group_id")
    )
    private List<UsersGroup> usersGroups;

    public boolean isAccountLocked() {
        if (accountLockedUntil == null) {
            return false;
        }
        return LocalDateTime.now().isBefore(accountLockedUntil);
    }
}
