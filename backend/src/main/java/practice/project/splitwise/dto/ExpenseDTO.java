package practice.project.splitwise.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDTO {
    private Integer id;
    private double amount;
    private String description;
    private String userName;
    private String splitType;
    private String category;
    private String notes;
    private String timestamp;
    private Boolean recurring;
    private String interval;
    private String nextDueDate;
    
    // Additional fields for frontend compatibility
    private Integer paidByUserID;
    private Integer groupID;
    private String groupName;
    private List<UserSplitReceivingDTO> userSplit;
}
