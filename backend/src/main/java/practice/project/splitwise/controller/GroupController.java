package practice.project.splitwise.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import practice.project.splitwise.dto.*;
import practice.project.splitwise.exception.GroupNotFoundException;
import practice.project.splitwise.exception.UserNotFoundException;
import practice.project.splitwise.exception.UserNotMemberOfGroupException;
import practice.project.splitwise.service.GroupService;
import practice.project.splitwise.service.UserDetailsServiceImpl;

import java.util.List;

@RestController
@RequestMapping("/api")
public class GroupController {
    @Autowired
    private GroupService groupService;
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @GetMapping("/settleUp/{groupId}/{userId}")
    public ResponseEntity settleUpForGroup(@PathVariable("groupId") int groupId,
                                           @PathVariable("userId") int userId) throws Exception {
        List<TransactionDTO> transactions = groupService.settleUpByGroupId(groupId, userId);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/groups/{groupId}/settle")
    public ResponseEntity groupSettled(@RequestBody SettledDTO settled) throws UserNotFoundException,
            UserNotMemberOfGroupException, GroupNotFoundException {
        groupService.groupSettled(settled);
        return ResponseEntity.ok("Yay... your all are settled.");
    }

    @PostMapping(value = "/createGroup")
    public ResponseEntity createGroup(@RequestBody GroupCreationDTO groupData) {
        GroupCreationResponseDTO newGroup = groupService.createGroup(groupData);
        return ResponseEntity.ok(newGroup);
    }

    @PostMapping(value = "/addExpense")
    public ResponseEntity addExpense(@RequestBody ExpenseReceivingDTO expenseData) throws Exception {
        ExpenseResponseDTO updatedGroup = groupService.addExpense(expenseData);
        return ResponseEntity.ok(updatedGroup);
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByFilter(
            @RequestParam Integer groupId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        List<ExpenseDTO> expenses = groupService.getExpensesByFilter(groupId, category, startDate, endDate, userEmail);
        return ResponseEntity.ok(expenses);
    }
    
    @GetMapping("/groups")
    public ResponseEntity<List<GroupCreationResponseDTO>> getAllGroups() {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        List<GroupCreationResponseDTO> groups = groupService.getAllGroupsForUser(userEmail);
        return ResponseEntity.ok(groups);
    }
    
    @DeleteMapping("/groups/{groupId}")
    public ResponseEntity<String> deleteGroup(@PathVariable int groupId) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            groupService.deleteGroup(groupId, userEmail);
            return ResponseEntity.ok("Group deleted successfully");
        } catch (GroupNotFoundException e) {
            return ResponseEntity.status(404).build();
        } catch (UserNotMemberOfGroupException e) {
            return ResponseEntity.status(403).body("You are not authorized to delete this group");
        }
    }
    
    @PostMapping("/groups/{groupId}/users/{userId}")
    public ResponseEntity<String> addUserToGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        try {
            groupService.addUserToGroup(userId, groupId);
            return ResponseEntity.ok("User added to group successfully");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(404).body("User not found");
        } catch (GroupNotFoundException e) {
            return ResponseEntity.status(404).body("Group not found");
        }
    }
    
    @GetMapping("/groups/{groupId}/users/{userId}/check")
    public ResponseEntity<Boolean> isUserInGroup(@PathVariable Long groupId, @PathVariable Long userId) {
        try {
            boolean isMember = groupService.isUserInGroup(userId, groupId);
            return ResponseEntity.ok(isMember);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(404).build();
        } catch (GroupNotFoundException e) {
            return ResponseEntity.status(404).build();
        }
    }
    
    @PostMapping("/groups/{groupId}/expenses/settle")
    public ResponseEntity<String> markAsSettled(@PathVariable int groupId, @RequestBody SettledDTO settledDTO) {
        try {
            groupService.markExpensesAsSettled(groupId, settledDTO.getUserId());
            return ResponseEntity.ok("All expenses marked as settled successfully");
        } catch (GroupNotFoundException e) {
            return ResponseEntity.status(404).body("Group not found");
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(404).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to mark expenses as settled: " + e.getMessage());
        }
    }
}
