package practice.project.splitwise.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import practice.project.splitwise.model.Budget;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepo extends JpaRepository<Budget, Long> {
    
    // Find budget by user, category, month, and year
    Optional<Budget> findByUser_IdAndCategoryAndMonthAndYearAndIsActiveTrue(
            Integer userId, String category, Integer month, Integer year);
    
    // Find all active budgets for a user in a specific month/year
    List<Budget> findByUser_IdAndMonthAndYearAndIsActiveTrue(
            Integer userId, Integer month, Integer year);
    
    // Find all active budgets for a user
    List<Budget> findByUser_IdAndIsActiveTrue(Integer userId);
    
    // Find budgets that are exceeded
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.month = :month AND b.year = :year AND b.isActive = true AND b.amountSpent > b.monthlyLimit")
    List<Budget> findExceededBudgets(@Param("userId") Integer userId, @Param("month") Integer month, @Param("year") Integer year);
    
    // Find budgets that are nearing limit (80% or more used)
    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId AND b.month = :month AND b.year = :year AND b.isActive = true AND (b.amountSpent / b.monthlyLimit) >= 0.8 AND b.amountSpent <= b.monthlyLimit")
    List<Budget> findNearingLimitBudgets(@Param("userId") Integer userId, @Param("month") Integer month, @Param("year") Integer year);
    
    // Check if budget exists for user, category, month, year
    boolean existsByUser_IdAndCategoryAndMonthAndYearAndIsActiveTrue(
            Integer userId, String category, Integer month, Integer year);
} 