package practice.project.splitwise.service;

import practice.project.splitwise.dto.BudgetCreationDTO;
import practice.project.splitwise.dto.BudgetDTO;
import practice.project.splitwise.dto.BudgetSummaryDTO;
import practice.project.splitwise.exception.UserNotFoundException;

import java.util.List;

public interface BudgetService {
    
    // Create or update a budget
    BudgetDTO createOrUpdateBudget(BudgetCreationDTO budgetCreationDTO) throws UserNotFoundException;
    
    // Get budget by ID
    BudgetDTO getBudgetById(Integer budgetId);
    
    // Get all budgets for a user in a specific month/year
    List<BudgetDTO> getUserBudgets(Integer userId, Integer month, Integer year);
    
    // Get budget summary for a user in a specific month/year
    BudgetSummaryDTO getBudgetSummary(Integer userId, Integer month, Integer year) throws UserNotFoundException;
    
    // Delete a budget (soft delete)
    void deleteBudget(Integer budgetId);
    
    // Update amount spent for a budget (called when expenses are added)
    void updateAmountSpent(Integer userId, String category, Double amount, Integer month, Integer year);
    
    // Get exceeded budgets for a user
    List<BudgetDTO> getExceededBudgets(Integer userId, Integer month, Integer year);
    
    // Get budgets nearing limit for a user
    List<BudgetDTO> getNearingLimitBudgets(Integer userId, Integer month, Integer year);
} 