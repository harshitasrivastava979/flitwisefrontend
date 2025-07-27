package practice.project.splitwise.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import practice.project.splitwise.dto.BudgetCreationDTO;
import practice.project.splitwise.dto.BudgetDTO;
import practice.project.splitwise.dto.BudgetSummaryDTO;
import practice.project.splitwise.exception.UserNotFoundException;
import practice.project.splitwise.model.Budget;
import practice.project.splitwise.model.Users;
import practice.project.splitwise.repository.BudgetRepo;
import practice.project.splitwise.repository.UserRepo;
import practice.project.splitwise.exception.UserNotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {
    
    @Autowired
    private BudgetRepo budgetRepo;
    
    @Autowired
    private UserRepo userRepo;
    
    @Override
    public BudgetDTO createOrUpdateBudget(BudgetCreationDTO budgetCreationDTO) throws UserNotFoundException {
        // Validate user exists
        Users user = userRepo.findById(budgetCreationDTO.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + budgetCreationDTO.getUserId()));

        // Set default month and year if not provided
        LocalDate currentDate = LocalDate.now();
        Integer month = budgetCreationDTO.getMonth() != null ? budgetCreationDTO.getMonth() : currentDate.getMonthValue();
        Integer year = budgetCreationDTO.getYear() != null ? budgetCreationDTO.getYear() : currentDate.getYear();

        // Check if budget already exists for this user, category, month, year
        Optional<Budget> existingBudget = budgetRepo.findByUser_IdAndCategoryAndMonthAndYearAndIsActiveTrue(
                budgetCreationDTO.getUserId(), budgetCreationDTO.getCategory(), month, year);

        Budget budget;
        if (existingBudget.isPresent()) {
            // Update existing budget
            budget = existingBudget.get();
            budget.setMonthlyLimit(budgetCreationDTO.getMonthlyLimit());
        } else {
            // Create new budget
            budget = new Budget();
            budget.setUser(user);
            budget.setCategory(budgetCreationDTO.getCategory());
            budget.setMonthlyLimit(budgetCreationDTO.getMonthlyLimit());
            budget.setMonth(month);
            budget.setYear(year);
            budget.setAmountSpent(0.0);
            budget.setIsActive(true);
        }

        Budget savedBudget = budgetRepo.save(budget);
        return convertToDTO(savedBudget);
    }

    @Override
    public BudgetDTO getBudgetById(Integer budgetId) {
        Budget budget = budgetRepo.findById((long)budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found with ID: " + budgetId));
        return convertToDTO(budget);
    }

    @Override
    public List<BudgetDTO> getUserBudgets(Integer userId, Integer month, Integer year) {
        List<Budget> budgets = budgetRepo.findByUser_IdAndMonthAndYearAndIsActiveTrue(userId, month, year);
        return budgets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BudgetSummaryDTO getBudgetSummary(Integer userId, Integer month, Integer year) throws UserNotFoundException {
        List<Budget> budgets = budgetRepo.findByUser_IdAndMonthAndYearAndIsActiveTrue(userId, month, year);
        
        BudgetSummaryDTO summary = new BudgetSummaryDTO();
        summary.setUserId(userId);
        summary.setMonth(month);
        summary.setYear(year);
        
        // Get user name
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        summary.setUserName(user.getName());
        
        // Calculate totals
        Double totalBudget = budgets.stream()
                .mapToDouble(Budget::getMonthlyLimit)
                .sum();
        Double totalSpent = budgets.stream()
                .mapToDouble(Budget::getAmountSpent)
                .sum();
        Double totalRemaining = Math.max(0.0, totalBudget - totalSpent);
        Double overallPercentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0.0;
        
        summary.setTotalBudget(totalBudget);
        summary.setTotalSpent(totalSpent);
        summary.setTotalRemaining(totalRemaining);
        summary.setOverallPercentageUsed(overallPercentageUsed);
        
        // Convert budgets to DTOs
        List<BudgetDTO> budgetDTOs = budgets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        summary.setCategoryBudgets(budgetDTOs);
        
        // Get exceeded and nearing limit categories
        List<String> exceededCategories = budgets.stream()
                .filter(Budget::isExceeded)
                .map(Budget::getCategory)
                .collect(Collectors.toList());
        summary.setExceededCategories(exceededCategories);
        
        List<String> nearingLimitCategories = budgets.stream()
                .filter(Budget::isNearingLimit)
                .filter(budget -> !budget.isExceeded())
                .map(Budget::getCategory)
                .collect(Collectors.toList());
        summary.setNearingLimitCategories(nearingLimitCategories);
        
        return summary;
    }
    
    @Override
    public void deleteBudget(Integer budgetId) {
        Budget budget = budgetRepo.findById((long)budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found with ID: " + budgetId));
        budget.setIsActive(false);
        budgetRepo.save(budget);
    }

    @Override
    public void updateAmountSpent(Integer userId, String category, Double amount, Integer month, Integer year) {
        System.out.println("Updating budget for user: " + userId + ", category: " + category +
                ", amount: " + amount + ", month: " + month + ", year: " + year);

        Optional<Budget> budgetOpt = budgetRepo.findByUser_IdAndCategoryAndMonthAndYearAndIsActiveTrue(
                userId, category, month, year);

        if (budgetOpt.isPresent()) {
            Budget budget = budgetOpt.get();
            System.out.println("Found budget, current amount spent: " + budget.getAmountSpent());
            budget.setAmountSpent(budget.getAmountSpent() + amount);
            budgetRepo.save(budget);
            System.out.println("Updated amount spent to: " + budget.getAmountSpent());
        } else {
            System.out.println("No budget found for user: " + userId + ", category: " + category);
        }
    }
    
    @Override
    public List<BudgetDTO> getExceededBudgets(Integer userId, Integer month, Integer year) {
        List<Budget> exceededBudgets = budgetRepo.findExceededBudgets(userId, month, year);
        return exceededBudgets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<BudgetDTO> getNearingLimitBudgets(Integer userId, Integer month, Integer year) {
        List<Budget> nearingLimitBudgets = budgetRepo.findNearingLimitBudgets(userId, month, year);
        return nearingLimitBudgets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private BudgetDTO convertToDTO(Budget budget) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(budget.getId());
        dto.setUserId(budget.getUser().getId());
        dto.setUserName(budget.getUser().getName());
        dto.setCategory(budget.getCategory());
        dto.setMonthlyLimit(budget.getMonthlyLimit());
        dto.setMonth(budget.getMonth());
        dto.setYear(budget.getYear());
        dto.setAmountSpent(budget.getAmountSpent());
        dto.setRemainingBudget(budget.getRemainingBudget());
        dto.setPercentageUsed(budget.getPercentageUsed());
        dto.setIsExceeded(budget.isExceeded());
        dto.setIsNearingLimit(budget.isNearingLimit());
        dto.setIsActive(budget.getIsActive());
        return dto;
    }
} 