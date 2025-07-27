package practice.project.splitwise.dto;

import lombok.Data;

@Data
public class BudgetDTO {
    private Integer id;
    private Integer userId;
    private String userName;
    private String category;
    private Double monthlyLimit;
    private Integer month;
    private Integer year;
    private Double amountSpent;
    private Double remainingBudget;
    private Double percentageUsed;
    private Boolean isExceeded;
    private Boolean isNearingLimit;
    private Boolean isActive;
} 