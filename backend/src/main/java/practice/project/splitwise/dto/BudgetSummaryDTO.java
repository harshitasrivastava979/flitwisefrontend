package practice.project.splitwise.dto;

import lombok.Data;
import java.util.List;

@Data
public class BudgetSummaryDTO {
    private Integer userId;
    private String userName;
    private Integer month;
    private Integer year;
    private Double totalBudget;
    private Double totalSpent;
    private Double totalRemaining;
    private Double overallPercentageUsed;
    private List<BudgetDTO> categoryBudgets;
    private List<String> exceededCategories;
    private List<String> nearingLimitCategories;
} 