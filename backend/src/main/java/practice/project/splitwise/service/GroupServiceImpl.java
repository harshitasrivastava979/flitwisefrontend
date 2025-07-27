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

        return strategy.settleUp(unsettledExpense);
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
        savedGroup.setUsers(allUsers);
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
    public List<ExpenseDTO> getExpensesByFilter(Integer groupId, String category, String startDate, String endDate) {
        Optional<UsersGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) return new ArrayList<>();
        List<Expense> expenses = groupOpt.get().getExpenses();
        return expenses.stream()
                .filter(ex -> (category == null || (ex.getCategory() != null && ex.getCategory().equalsIgnoreCase(category)))
                        && (startDate == null || (ex.getTimestamp() != null && !ex.getTimestamp().before(java.sql.Timestamp.valueOf(startDate))))
                        && (endDate == null || (ex.getTimestamp() != null && !ex.getTimestamp().after(java.sql.Timestamp.valueOf(endDate)))))
                .map(ex -> {
                    ExpenseDTO dto = new ExpenseDTO();
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
                    return dto;
                })
                .collect(Collectors.toList());
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
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(ex.getNextDueDate());
            switch (ex.getInterval() != null ? ex.getInterval().toLowerCase() : "") {
                case "daily": cal.add(java.util.Calendar.DATE, 1); break;
                case "weekly": cal.add(java.util.Calendar.DATE, 7); break;
                case "monthly": cal.add(java.util.Calendar.MONTH, 1); break;
                default: break;
            }
            newExpense.setNextDueDate(cal.getTime());
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
