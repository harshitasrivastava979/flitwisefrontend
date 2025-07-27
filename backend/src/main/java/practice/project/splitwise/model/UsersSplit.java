package practice.project.splitwise.model;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsersSplit extends BaseModel {
    @ManyToOne
    private Users user;

    private double amount;
    private Double percentage; // For percentage split
    private Integer shares;    // For shares/ratio split
}
