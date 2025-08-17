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
  //  @Column(name = "email_verified")
   // private Boolean emailVerified = false;

 //   @Column(name = "account_locked_until")
    //private LocalDateTime accountLockedUntil;
// Added for authentication

    @ManyToMany
    @JoinTable(
            name = "user_group_mapping",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "group_id")
    )
    private List<UsersGroup> usersGroups;
}
