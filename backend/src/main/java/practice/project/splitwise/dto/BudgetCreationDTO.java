package practice.project.splitwise.dto;

import lombok.Data;

@Data
public class BudgetCreationDTO {
    private Integer userId;
    private String category;
    private Double monthlyLimit;
    private Integer month; // Optional - defaults to current month
    private Integer year;  // Optional - defaults to current year
} 