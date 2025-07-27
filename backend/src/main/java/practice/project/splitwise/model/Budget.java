package practice.project.splitwise.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class Budget extends BaseModel {
    
    @ManyToOne
    @JoinColumn(name = "userId")
    private Users user;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false)
    private Double monthlyLimit;
    
    @Column(nullable = false)
    private Integer month; // 1-12
    
    @Column(nullable = false)
    private Integer year;
    
    @Column(nullable = false)
    private Double amountSpent = 0.0;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    // Helper method to get remaining budget
    public Double getRemainingBudget() {
        return Math.max(0.0, monthlyLimit - amountSpent);
    }
    
    // Helper method to get percentage used
    public Double getPercentageUsed() {
        if (monthlyLimit == 0) return 0.0;
        return (amountSpent / monthlyLimit) * 100;
    }
    
    // Helper method to check if budget is exceeded
    public Boolean isExceeded() {
        return amountSpent > monthlyLimit;
    }
    
    // Helper method to check if budget is nearing limit (80% threshold)
    public Boolean isNearingLimit() {
        return getPercentageUsed() >= 80.0;
    }
} 