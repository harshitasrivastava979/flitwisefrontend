package practice.project.splitwise.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ExpenseReceivingDTO {
    private Integer groupID;
    private double amount;
    private String description;
    private Integer paidByUserID;
    private String splitType; // EQUAL, PERCENTAGE, EXACT, SHARES
    private String category;
    private String notes;
    private String timestamp;
    private Boolean recurring;
    private String interval;
    private String nextDueDate;
    private List<UserSplitReceivingDTO> userSplit;
}
