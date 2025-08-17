package practice.project.splitwise.service;

import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import practice.project.splitwise.dto.*;
import practice.project.splitwise.exception.GroupNotFoundException;
import practice.project.splitwise.exception.UserNotFoundException;
import practice.project.splitwise.exception.UserNotMemberOfGroupException;
import practice.project.splitwise.model.*;
import practice.project.splitwise.repository.ExpenseRepo;
import practice.project.splitwise.repository.GroupRepo;
import practice.project.splitwise.repository.UserRepo;
import practice.project.splitwise.repository.UsersSplitRepo;
import practice.project.splitwise.service.strategy.SettleUpFactory;
import practice.project.splitwise.service.strategy.SettleUpStrategy;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Data
@Service
public class GroupServiceImpl implements GroupService {
    @Autowired
    private GroupRepo groupRepository;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private ExpenseRepo expenseRepo;

    @Autowired
    private UsersSplitRepo usersSplitRepo;
    
    @Autowired
    private BudgetService budgetService;

    @Override
    public List<TransactionDTO> settleUpByGroupId(int groupId, int userId) throws UserNotFoundException, GroupNotFoundException, UserNotMemberOfGroupException {
        // check if valid user exist
        Optional<Users> currUser = userRepo.findById(userId);
        if (currUser.isEmpty()) {
            throw new UserNotFoundException("User not found in the database.");
        }
        // check if valid group exist
        Optional<UsersGroup> savedGroup = groupRepository.findById(groupId);
        if (savedGroup.isEmpty()) {
            throw new GroupNotFoundException("Group for the given id was not found. Id : " + groupId);
        }
        // check if user is member of group
        if (!currUser.get().getUsersGroups().contains(savedGroup.get())) {
            throw new UserNotMemberOfGroupException("User is not a member of group.");
        }

        // if all validations passed
        SettleUpStrategy strategy = SettleUpFactory.getSettleUpStrategy(SettleUpStrategyType.HeapBased);
        List<Expense> unsettledExpense = savedGroup.get().getExpenses().stream()
                .filter(expense -> expense.getIsSettled() != Settled.SETTLED)
                .collect(Collectors.toList());

        List<TransactionDTO> transactions = strategy.settleUp(unsettledExpense);
        
        // DEBUG: Print what's being returned
        System.out.println("=== SETTLEMENT DEBUG ===");
        System.out.println("Group ID: " + groupId);
        System.out.println("Unsettled expenses count: " + unsettledExpense.size());
        System.out.println("Transactions generated: " + transactions.size());
        
        transactions.forEach(t -> 
            System.out.println("Transaction: " + t.getFromUserName() + " (ID: " + t.getFromUserId() + 
                             ") owes " + t.getToUserName() + " (ID: " + t.getToUserId() + 
                             "): ₹" + t.getAmount())
        );
        System.out.println("=== END DEBUG ===");
        
        return transactions;
    }

    @Override
    public GroupCreationResponseDTO createGroup(GroupCreationDTO groupData) {
        // Create a group
        UsersGroup group = new UsersGroup();
        group.setName(groupData.getName());
        group.setDescription(groupData.getDescription());
        group.setDefaultCurrency(groupData.getCurrency());
        group.setIsSettled(Settled.SETTLED);
        UsersGroup savedGroup = groupRepository.save(group);

        // add the users
        List<Users> allUsers = new ArrayList<>();
        for (Users user : groupData.getUsersList()) {
            Users currUser;
            Optional<Users> existingUser = userRepo.findByMail(user.getMail());
            if (existingUser.isPresent()) {
                existingUser.get().setName(user.getName());
                currUser = userRepo.save(existingUser.get());
            } else {
                currUser = userRepo.save(user);
            }
            allUsers.add(currUser);
        }
        
        // Properly establish the many-to-many relationship
        // Set users on the group side
        savedGroup.setUsers(allUsers);
        
        // Set the group on each user's side (this is what creates the join table entries)
        for (Users user : allUsers) {
            if (user.getUsersGroups() == null) {
                user.setUsersGroups(new ArrayList<>());
            }
            user.getUsersGroups().add(savedGroup);
            userRepo.save(user); // This triggers the insert into user_group_mapping
        }
        
        savedGroup = groupRepository.save(savedGroup);

        //creating response dto
        GroupCreationResponseDTO responseDTO = new GroupCreationResponseDTO();
        responseDTO.setId(savedGroup.getId());
        responseDTO.setName(savedGroup.getName());
        responseDTO.setDescription(savedGroup.getDescription());
        responseDTO.setCurrency(savedGroup.getDefaultCurrency());
        responseDTO.setTotalSpending(0.0);
        List<UserResponseDTO> userResponseDTOList = new ArrayList<>();
        for (Users user : savedGroup.getUsers()) {
            userResponseDTOList.add(new UserResponseDTO(user.getId(), user.getName(), user.getMail()));
        }
        responseDTO.setUsersList(userResponseDTOList);
        return responseDTO;
    }

    @Override
    public ExpenseResponseDTO addExpense(ExpenseReceivingDTO expenseData) throws UserNotFoundException,
            GroupNotFoundException, UserNotMemberOfGroupException {
        // validations of group and User
        Optional<UsersGroup> group = groupRepository.findById(expenseData.getGroupID());
        if (group.isEmpty()) {
            throw new GroupNotFoundException("Group not found in the database.");
        }
        Optional<Users> payingUser = userRepo.findById(expenseData.getPaidByUserID());
        if (payingUser.isEmpty()) {
            throw new UserNotFoundException("Paid user not found in the database.");
        }
        if (!payingUser.get().getUsersGroups().contains(group.get())) {
            throw new UserNotMemberOfGroupException("User who paid is not a member of group.");
        }

        Expense expense = new Expense();
        expense.setAmount(expenseData.getAmount());
        expense.setDescription(expenseData.getDescription());
        expense.setPaidBy(payingUser.get());
        expense.setIsSettled(Settled.NOT_SETTLED);
        expense.setSplitType(expenseData.getSplitType());
        expense.setCategory(expenseData.getCategory());
        expense.setNotes(expenseData.getNotes());
        if (expenseData.getTimestamp() != null) {
            expense.setTimestamp(java.sql.Timestamp.valueOf(expenseData.getTimestamp()));
        } else {
            expense.setTimestamp(new java.util.Date());
        }
        expense.setRecurring(expenseData.getRecurring() != null ? expenseData.getRecurring() : false);
        expense.setInterval(expenseData.getInterval());
        if (expenseData.getNextDueDate() != null) {
            expense.setNextDueDate(java.sql.Timestamp.valueOf(expenseData.getNextDueDate()));
        }

        List<UsersSplit> usersSplits = new ArrayList<>();
        String splitType = expenseData.getSplitType() != null ? expenseData.getSplitType().toUpperCase() : "EQUAL";
        List<UserSplitReceivingDTO> splits = expenseData.getUserSplit();
        int n = splits.size();
        double totalAmount = expenseData.getAmount();

        switch (splitType) {
            case "EQUAL":
                double equalAmount = Math.round((totalAmount / n) * 100.0) / 100.0;
                for (UserSplitReceivingDTO split : splits) {
                    Optional<Users> currUser = userRepo.findById(split.getUserId());
                    if (currUser.isEmpty()) throw new UserNotFoundException("User not found in the database.");
                    if (!currUser.get().getUsersGroups().contains(group.get())) throw new UserNotMemberOfGroupException("User is not a member of group.");
                    usersSplits.add(new UsersSplit(currUser.get(), -1 * equalAmount, null, null));
                }
                usersSplits.add(new UsersSplit(payingUser.get(), totalAmount, null, null));
                break;
            case "PERCENTAGE":
                for (UserSplitReceivingDTO split : splits) {
                    Optional<Users> currUser = userRepo.findById(split.getUserId());
                    if (currUser.isEmpty()) throw new UserNotFoundException("User not found in the database.");
                    if (!currUser.get().getUsersGroups().contains(group.get())) throw new UserNotMemberOfGroupException("User is not a member of group.");
                    double percent = split.getPercentage() != null ? split.getPercentage() : 0.0;
                    double amt = Math.round((totalAmount * percent / 100.0) * 100.0) / 100.0;
                    usersSplits.add(new UsersSplit(currUser.get(), -1 * amt, percent, null));
                }
                usersSplits.add(new UsersSplit(payingUser.get(), totalAmount, null, null));
                break;
            case "EXACT":
                for (UserSplitReceivingDTO split : splits) {
                    Optional<Users> currUser = userRepo.findById(split.getUserId());
                    if (currUser.isEmpty()) throw new UserNotFoundException("User not found in the database.");
                    if (!currUser.get().getUsersGroups().contains(group.get())) throw new UserNotMemberOfGroupException("User is not a member of group.");
                    double amt = split.getAmount() != null ? split.getAmount() : 0.0;
                    usersSplits.add(new UsersSplit(currUser.get(), -1 * amt, null, null));
                }
                usersSplits.add(new UsersSplit(payingUser.get(), totalAmount, null, null));
                break;
            case "SHARES":
                int totalShares = splits.stream().mapToInt(s -> s.getShares() != null ? s.getShares() : 0).sum();
                for (UserSplitReceivingDTO split : splits) {
                    Optional<Users> currUser = userRepo.findById(split.getUserId());
                    if (currUser.isEmpty()) throw new UserNotFoundException("User not found in the database.");
                    if (!currUser.get().getUsersGroups().contains(group.get())) throw new UserNotMemberOfGroupException("User is not a member of group.");
                    int shares = split.getShares() != null ? split.getShares() : 0;
                    double amt = totalShares > 0 ? Math.round((totalAmount * shares / totalShares) * 100.0) / 100.0 : 0.0;
                    usersSplits.add(new UsersSplit(currUser.get(), -1 * amt, null, shares));
                }
                usersSplits.add(new UsersSplit(payingUser.get(), totalAmount, null, null));
                break;
            default:
                throw new IllegalArgumentException("Invalid split type");
        }

        for (UsersSplit split : usersSplits) {
            usersSplitRepo.save(split);
        }
        expense.setAmountSplit(usersSplits);
        Expense savedExpense = expenseRepo.save(expense);
        List<Expense> allExpenses = group.get().getExpenses();
        allExpenses.add(savedExpense);
        group.get().setExpenses(allExpenses);
        Double amountSpent = group.get().getTotalAmountSpent() + expenseData.getAmount();
        group.get().setTotalAmountSpent(amountSpent);
        group.get().setIsSettled(Settled.NOT_SETTLED);
        UsersGroup savedGroup = groupRepository.save(group.get());
        
                // Update budget for each user based on their individual split amount
        if (expenseData.getCategory() != null) {
            java.util.Date expenseDate = savedExpense.getTimestamp();
            java.time.LocalDate localDate = expenseDate.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            
            for (UsersSplit split : usersSplits) {
                if (split.getAmount() < 0) { // Only for users who owe money (negative amounts)
                    budgetService.updateAmountSpent(
                        split.getUser().getId(),
                        expenseData.getCategory(),
                        -split.getAmount(), // Convert negative to positive
                        localDate.getMonthValue(),
                        localDate.getYear()
                    );
                }
                System.out.println("Updating budget for user: " + split.getUser().getId() + ", category: " + expenseData.getCategory() + ", amount: " + (-split.getAmount()));
            }

        }

        ExpenseResponseDTO responseDTO = new ExpenseResponseDTO();
        responseDTO.setName(savedGroup.getName());
        responseDTO.setDescription(savedGroup.getDescription());
        responseDTO.setCurrency(savedGroup.getDefaultCurrency());
        responseDTO.setTotalSpending(savedGroup.getTotalAmountSpent());
        responseDTO.setIsGroupSettled(Settled.NOT_SETTLED);
        List<Expense> savedGroupExpenses = savedGroup.getExpenses();
        List<ExpenseDTO> expenseResponse = savedGroupExpenses.stream()
                .filter(ex -> ex.getIsSettled() == Settled.NOT_SETTLED)
                .map(ex -> {
                    ExpenseDTO dto = new ExpenseDTO();
                    dto.setId(ex.getId().intValue());
                    dto.setAmount(ex.getAmount());
                    dto.setDescription(ex.getDescription());
                    dto.setUserName(ex.getPaidBy().getName());
                    dto.setSplitType(ex.getSplitType());
                    dto.setCategory(ex.getCategory());
                    dto.setNotes(ex.getNotes());
                    dto.setTimestamp(ex.getTimestamp() != null ? ex.getTimestamp().toString() : null);
                    dto.setRecurring(ex.getRecurring());
                    dto.setInterval(ex.getInterval());
                    dto.setNextDueDate(ex.getNextDueDate() != null ? ex.getNextDueDate().toString() : null);
                    
                    // Set additional fields for frontend compatibility
                    if (ex.getPaidBy() != null) {
                        dto.setPaidByUserID(ex.getPaidBy().getId().intValue());
                    }
                    dto.setGroupID(savedGroup.getId().intValue());
                    dto.setGroupName(savedGroup.getName());
                    
                    // Convert user splits
                    if (ex.getAmountSplit() != null) {
                        List<UserSplitReceivingDTO> userSplitDTOs = new ArrayList<>();
                        for (UsersSplit split : ex.getAmountSplit()) {
                            UserSplitReceivingDTO splitDTO = new UserSplitReceivingDTO();
                            splitDTO.setUserId(split.getUser().getId().intValue());
                            splitDTO.setAmount(split.getAmount());
                            splitDTO.setPercentage(split.getPercentage());
                            splitDTO.setShares(split.getShares());
                            userSplitDTOs.add(splitDTO);
                        }
                        dto.setUserSplit(userSplitDTOs);
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
        responseDTO.setExpenseDTOList(expenseResponse);
        return responseDTO;
    }

    @Override
    public void groupSettled(SettledDTO settledDTO) throws UserNotFoundException,
            GroupNotFoundException, UserNotMemberOfGroupException {
        // validations of group and User
        Optional<Users> user = userRepo.findById(settledDTO.getUserId());
        if (user.isEmpty()) {
            throw new UserNotFoundException("Paid user not found in the database.");
        }

        Optional<UsersGroup> group = groupRepository.findById(settledDTO.getGroupId());
        if (group.isEmpty()) {
            throw new GroupNotFoundException("Group not found in the database.");
        }
        if (!user.get().getUsersGroups().contains(group.get())) {
            throw new UserNotMemberOfGroupException("User who paid is not a member of group.");
        }
        group.get().setIsSettled(Settled.SETTLED);
        for (Expense expense : group.get().getExpenses()
        ) {
            expense.setIsSettled(Settled.SETTLED);
            expenseRepo.save(expense);
        }
        groupRepository.save(group.get());
    }

    @Override
    public List<ExpenseDTO> getExpensesByFilter(Integer groupId, String category, String startDate, String endDate, String userEmail) {
        System.out.println("getExpensesByFilter called with groupId: " + groupId + ", userEmail: " + userEmail);
        
        // Find the group first
        Optional<UsersGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            System.out.println("Group not found with ID: " + groupId);
            return new ArrayList<>();
        }
        
        UsersGroup group = groupOpt.get();
        System.out.println("Found group: " + group.getName() + " (ID: " + group.getId() + ")");
        
        // Check if user is a member of this group
        Optional<Users> userOpt = userRepo.findByMail(userEmail);
        if (userOpt.isEmpty()) {
            System.out.println("User not found for email: " + userEmail);
            return new ArrayList<>();
        }
        
        Users user = userOpt.get();
        System.out.println("Found user: " + user.getName() + " (ID: " + user.getId() + ")");
        
        if (!group.getUsers().contains(user)) {
            System.out.println("User " + user.getName() + " is not a member of group " + group.getName());
            return new ArrayList<>(); // Return empty list if user is not a member
        }
        
        System.out.println("User " + user.getName() + " is a member of group " + group.getName());
        List<Expense> groupExpenses = group.getExpenses();
        System.out.println("Group has " + (groupExpenses != null ? groupExpenses.size() : 0) + " expenses");
        
        // Apply filters if provided
        List<Expense> filteredExpenses = groupExpenses.stream()
            .filter(expense -> {
                // Category filter
                if (category != null && !category.isEmpty()) {
                    if (!category.equals(expense.getCategory())) {
                        return false;
                    }
                }
                
                // Date range filter
                if (startDate != null && !startDate.isEmpty()) {
                    try {
                        java.sql.Date start = java.sql.Date.valueOf(startDate);
                        if (expense.getTimestamp().before(start)) {
                            return false;
                        }
                    } catch (Exception e) {
                        // If date parsing fails, skip this filter
                    }
                }
                
                if (endDate != null && !endDate.isEmpty()) {
                    try {
                        java.sql.Date end = java.sql.Date.valueOf(endDate);
                        if (expense.getTimestamp().after(end)) {
                            return false;
                        }
                    } catch (Exception e) {
                        // If date parsing fails, skip this filter
                    }
                }
                
                return true;
            })
            .collect(Collectors.toList());
        
        System.out.println("Filtered expenses count: " + filteredExpenses.size());
        
        // Convert to DTOs
        List<ExpenseDTO> expenseDTOs = new ArrayList<>();
        for (Expense expense : filteredExpenses) {
            ExpenseDTO dto = new ExpenseDTO();
            dto.setId(expense.getId().intValue());
            dto.setAmount(expense.getAmount());
            dto.setDescription(expense.getDescription());
            dto.setCategory(expense.getCategory());
            dto.setSplitType(expense.getSplitType());
            dto.setNotes(expense.getNotes());
            dto.setRecurring(expense.getRecurring());
            dto.setInterval(expense.getInterval());
            
            // Set timestamp as string
            if (expense.getTimestamp() != null) {
                dto.setTimestamp(expense.getTimestamp().toString());
            }
            
            // Set next due date as string
            if (expense.getNextDueDate() != null) {
                dto.setNextDueDate(expense.getNextDueDate().toString());
            }
            
            // Set user name and ID
            if (expense.getPaidBy() != null) {
                dto.setUserName(expense.getPaidBy().getName());
                dto.setPaidByUserID(expense.getPaidBy().getId().intValue());
            }
            
            // Set group info
            dto.setGroupID(groupId);
            dto.setGroupName(group.getName());
            
            // Convert user splits
            if (expense.getAmountSplit() != null) {
                List<UserSplitReceivingDTO> userSplitDTOs = new ArrayList<>();
                for (UsersSplit split : expense.getAmountSplit()) {
                    UserSplitReceivingDTO splitDTO = new UserSplitReceivingDTO();
                    splitDTO.setUserId(split.getUser().getId().intValue());
                    splitDTO.setAmount(split.getAmount());
                    splitDTO.setPercentage(split.getPercentage());
                    splitDTO.setShares(split.getShares());
                    userSplitDTOs.add(splitDTO);
                }
                dto.setUserSplit(userSplitDTOs);
            }
            
            expenseDTOs.add(dto);
        }
        
        System.out.println("Returning " + expenseDTOs.size() + " expense DTOs");
        return expenseDTOs;
    }
    
    @Override
    public List<GroupCreationResponseDTO> getAllGroupsForUser(String userEmail) {
        // Find the user first
        Optional<Users> userOpt = userRepo.findByMail(userEmail);
        if (userOpt.isEmpty()) {
            System.out.println("User not found for email: " + userEmail);
            return new ArrayList<>();
        }
        
        Users user = userOpt.get();
        System.out.println("Found user: " + user.getName() + " (ID: " + user.getId() + ")");
        
        List<UsersGroup> userGroups = user.getUsersGroups();
        System.out.println("User has " + (userGroups != null ? userGroups.size() : 0) + " groups");
        
        List<GroupCreationResponseDTO> responseDTOs = new ArrayList<>();
        
        if (userGroups != null) {
            for (UsersGroup group : userGroups) {
                System.out.println("Processing group: " + group.getName() + " (ID: " + group.getId() + ")");
                
                GroupCreationResponseDTO responseDTO = new GroupCreationResponseDTO();
                responseDTO.setId(group.getId());
                responseDTO.setName(group.getName());
                responseDTO.setDescription(group.getDescription());
                responseDTO.setCurrency(group.getDefaultCurrency());
                
                // Calculate total spending
                double totalSpending = group.getExpenses().stream()
                        .mapToDouble(Expense::getAmount)
                        .sum();
                responseDTO.setTotalSpending(totalSpending);
                
                // Convert users to UserResponseDTO
                List<UserResponseDTO> userResponseDTOList = new ArrayList<>();
                if (group.getUsers() != null) {
                    for (Users groupUser : group.getUsers()) {
                        UserResponseDTO userResponseDTO = new UserResponseDTO(groupUser.getId(), groupUser.getName(), groupUser.getMail());
                        userResponseDTOList.add(userResponseDTO);
                    }
                }
                responseDTO.setUsersList(userResponseDTOList);
                
                responseDTOs.add(responseDTO);
            }
        }
        
        System.out.println("Returning " + responseDTOs.size() + " groups for user");
        return responseDTOs;
    }
    
    @Override
    public void deleteGroup(int groupId, String userEmail) throws GroupNotFoundException, UserNotMemberOfGroupException {
        Optional<UsersGroup> group = groupRepository.findById(groupId);
        if (group.isEmpty()) {
            throw new GroupNotFoundException("Group not found with id: " + groupId);
        }
        
        // Check if user is a member of this group
        Optional<Users> userOpt = userRepo.findByMail(userEmail);
        if (userOpt.isEmpty()) {
            throw new UserNotMemberOfGroupException("User not found");
        }
        
        Users user = userOpt.get();
        if (!group.get().getUsers().contains(user)) {
            throw new UserNotMemberOfGroupException("User is not a member of this group");
        }
        
        // Delete all expenses associated with this group
        List<Expense> groupExpenses = group.get().getExpenses();
        for (Expense expense : groupExpenses) {
            // Delete all user splits for this expense
            usersSplitRepo.deleteAll(expense.getAmountSplit());
        }
        expenseRepo.deleteAll(groupExpenses);
        
        // Delete the group
        groupRepository.delete(group.get());
    }

    @Override
    public void addUserToGroup(Long userId, Long groupId) throws UserNotFoundException, GroupNotFoundException {
        // Find the user
        Optional<Users> userOpt = userRepo.findById(Long.valueOf(userId));
        if (userOpt.isEmpty()) {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
        
        // Find the group
        Optional<UsersGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new GroupNotFoundException("Group not found with id: " + groupId);
        }
        
        Users user = userOpt.get();
        UsersGroup group = groupOpt.get();
        
        // Check if user is already a member
        if (user.getUsersGroups() != null && user.getUsersGroups().contains(group)) {
            return; // User is already a member
        }
        
        // Add user to group (this is the key part that creates the join table entry)
        if (user.getUsersGroups() == null) {
            user.setUsersGroups(new ArrayList<>());
        }
        user.getUsersGroups().add(group);
        userRepo.save(user); // This triggers the insert into user_group_mapping
        
        // Also update the group side for consistency
        if (group.getUsers() == null) {
            group.setUsers(new ArrayList<>());
        }
        group.getUsers().add(user);
        groupRepository.save(group);
    }
    
    @Override
    public boolean isUserInGroup(Long userId, Long groupId) throws UserNotFoundException, GroupNotFoundException {
        // Find the user
        Optional<Users> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
        
        // Find the group
        Optional<UsersGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new GroupNotFoundException("Group not found with id: " + groupId);
        }
        
        Users user = userOpt.get();
        UsersGroup group = groupOpt.get();
        
        // Check if user is a member of the group
        return user.getUsersGroups() != null && user.getUsersGroups().contains(group);
    }
    
    @Override
    public void markExpensesAsSettled(int groupId, int userId) throws GroupNotFoundException, UserNotFoundException {
        // Validate user exists
        Optional<Users> userOpt = userRepo.findById((long) userId);
        if (userOpt.isEmpty()) {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
        
        // Validate group exists
        Optional<UsersGroup> groupOpt = groupRepository.findById((long) groupId);
        if (groupOpt.isEmpty()) {
            throw new GroupNotFoundException("Group not found with id: " + groupId);
        }
        
        UsersGroup group = groupOpt.get();
        
        // Mark all unsettled expenses as settled
        boolean hasUnsettledExpenses = false;
        for (Expense expense : group.getExpenses()) {
            if (expense.getIsSettled() != Settled.SETTLED) {
                expense.setIsSettled(Settled.SETTLED);
                expenseRepo.save(expense);
                hasUnsettledExpenses = true;
            }
        }
        
        // Update group status to settled
        if (hasUnsettledExpenses) {
            group.setIsSettled(Settled.SETTLED);
            groupRepository.save(group);
        }
        
        // Clear all user splits to reset balances
        for (Expense expense : group.getExpenses()) {
            if (expense.getAmountSplit() != null) {
                for (UsersSplit split : expense.getAmountSplit()) {
                    // Reset split amounts to zero for settled expenses
                    split.setAmount(0.0);
                    split.setPercentage(null);
                    split.setShares(null);
                    usersSplitRepo.save(split);
                }
            }
        }
        
        System.out.println("=== SETTLEMENT COMPLETE ===");
        System.out.println("Group " + groupId + " marked as settled by user " + userId);
        System.out.println("All expenses marked as SETTLED");
        System.out.println("All user splits reset to zero");
        System.out.println("Group status: SETTLED");
        System.out.println("=== END SETTLEMENT ===");
    }

    @Scheduled(cron = "0 * * * * *") // Runs daily at midnight
    @Transactional
    public void processRecurringExpenses() {
        List<Expense> recurringExpenses = expenseRepo.findAll().stream()
                .filter(ex -> Boolean.TRUE.equals(ex.getRecurring()) && ex.getNextDueDate() != null && !ex.getNextDueDate().after(new java.util.Date()))
                .collect(Collectors.toList());
        for (Expense ex : recurringExpenses) {
            Expense newExpense = new Expense();
            newExpense.setAmount(ex.getAmount());
            newExpense.setDescription(ex.getDescription());
            newExpense.setPaidBy(ex.getPaidBy());
            newExpense.setIsSettled(Settled.NOT_SETTLED);
            newExpense.setSplitType(ex.getSplitType());
            newExpense.setCategory(ex.getCategory());
            newExpense.setNotes(ex.getNotes());
            newExpense.setTimestamp(new java.util.Date());
            newExpense.setRecurring(ex.getRecurring());
            newExpense.setInterval(ex.getInterval());
            // Calculate nextDueDate based on interval
            Calendar cal = Calendar.getInstance();
            cal.setTime(ex.getNextDueDate());
            switch (ex.getInterval() != null ? ex.getInterval().toLowerCase() : "") {
                case "daily": cal.add(java.util.Calendar.DATE, 1); break;
                case "weekly": cal.add(java.util.Calendar.DATE, 7); break;
                case "monthly": cal.add(java.util.Calendar.MONTH, 1); break;
                default: break;
            }
            newExpense.setNextDueDate(ex.getNextDueDate());
            // Deep copy splits
            List<UsersSplit> newSplits = new ArrayList<>();
            if (ex.getAmountSplit() != null) {
                for (UsersSplit split : ex.getAmountSplit()) {
                    UsersSplit newSplit = new UsersSplit();
                    newSplit.setUser(split.getUser());
                    newSplit.setAmount(split.getAmount());
                    newSplit.setPercentage(split.getPercentage());
                    newSplit.setShares(split.getShares());
                    usersSplitRepo.save(newSplit);
                    newSplits.add(newSplit);
                }
            }
            newExpense.setAmountSplit(newSplits);
            expenseRepo.save(newExpense);
            // Update budget for recurring expenses - each user based on their split
            if (newExpense.getCategory() != null) {
                java.util.Date expenseDate = newExpense.getTimestamp();
                java.time.LocalDate localDate = expenseDate.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                
                for (UsersSplit split : newSplits) {
                    if (split.getAmount() < 0) { // Only for users who owe money (negative amounts)
                        budgetService.updateAmountSpent(
                            split.getUser().getId(),
                            newExpense.getCategory(),
                            -split.getAmount(), // Convert negative to positive
                            localDate.getMonthValue(),
                            localDate.getYear()
                        );
                    }
                }
            }
            
            // Update original expense's nextDueDate
            ex.setNextDueDate(cal.getTime());
            expenseRepo.save(ex);
        }
    }
}
