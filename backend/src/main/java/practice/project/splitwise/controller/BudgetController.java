package practice.project.splitwise.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import practice.project.splitwise.dto.BudgetCreationDTO;
import practice.project.splitwise.dto.BudgetDTO;
import practice.project.splitwise.dto.BudgetSummaryDTO;
import practice.project.splitwise.exception.UserNotFoundException;
import practice.project.splitwise.service.BudgetService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {
    
    @Autowired
    private BudgetService budgetService;
    
    // Create or update a budget
    @PostMapping
    public ResponseEntity<BudgetDTO> createOrUpdateBudget(@RequestBody BudgetCreationDTO budgetCreationDTO) throws UserNotFoundException {
        BudgetDTO budget = budgetService.createOrUpdateBudget(budgetCreationDTO);
        return ResponseEntity.ok(budget);
    }
    
    // Get budget by ID
    @GetMapping("/{budgetId}")
    public ResponseEntity<BudgetDTO> getBudgetById(@PathVariable Integer budgetId) {
        BudgetDTO budget = budgetService.getBudgetById(budgetId);
        return ResponseEntity.ok(budget);
    }
    
    // Get all budgets for a user in a specific month/year
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BudgetDTO>> getUserBudgets(
            @PathVariable Integer userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        
        // Default to current month/year if not provided
        LocalDate currentDate = LocalDate.now();
        Integer targetMonth = month != null ? month : currentDate.getMonthValue();
        Integer targetYear = year != null ? year : currentDate.getYear();
        
        List<BudgetDTO> budgets = budgetService.getUserBudgets(userId, targetMonth, targetYear);
        return ResponseEntity.ok(budgets);
    }
    
    // Get budget summary for a user
    @GetMapping("/summary/{userId}")
    public ResponseEntity<BudgetSummaryDTO> getBudgetSummary(
            @PathVariable Integer userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) throws UserNotFoundException {
        
        // Default to current month/year if not provided
        LocalDate currentDate = LocalDate.now();
        Integer targetMonth = month != null ? month : currentDate.getMonthValue();
        Integer targetYear = year != null ? year : currentDate.getYear();
        
        BudgetSummaryDTO summary = budgetService.getBudgetSummary(userId, targetMonth, targetYear);
        return ResponseEntity.ok(summary);
    }
    
    // Get exceeded budgets for a user
    @GetMapping("/exceeded/{userId}")
    public ResponseEntity<List<BudgetDTO>> getExceededBudgets(
            @PathVariable Integer userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        
        // Default to current month/year if not provided
        LocalDate currentDate = LocalDate.now();
        Integer targetMonth = month != null ? month : currentDate.getMonthValue();
        Integer targetYear = year != null ? year : currentDate.getYear();
        
        List<BudgetDTO> exceededBudgets = budgetService.getExceededBudgets(userId, targetMonth, targetYear);
        return ResponseEntity.ok(exceededBudgets);
    }
    
    // Get budgets nearing limit for a user
    @GetMapping("/nearing-limit/{userId}")
    public ResponseEntity<List<BudgetDTO>> getNearingLimitBudgets(
            @PathVariable Integer userId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        
        // Default to current month/year if not provided
        LocalDate currentDate = LocalDate.now();
        Integer targetMonth = month != null ? month : currentDate.getMonthValue();
        Integer targetYear = year != null ? year : currentDate.getYear();
        
        List<BudgetDTO> nearingLimitBudgets = budgetService.getNearingLimitBudgets(userId, targetMonth, targetYear);
        return ResponseEntity.ok(nearingLimitBudgets);
    }
    
    // Delete a budget (soft delete)
    @DeleteMapping("/{budgetId}")
    public ResponseEntity<String> deleteBudget(@PathVariable Integer budgetId) {
        budgetService.deleteBudget(budgetId);
        return ResponseEntity.ok("Budget deleted successfully");
    }
} 