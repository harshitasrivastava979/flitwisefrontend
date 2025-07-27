package practice.project.splitwise.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSplitReceivingDTO {
    private Integer userId;
    private Double amount;
    private Double percentage; // For percentage split
    private Integer shares;    // For shares/ratio split
}
