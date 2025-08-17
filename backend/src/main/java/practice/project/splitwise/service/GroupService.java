package practice.project.splitwise.service;

import practice.project.splitwise.dto.*;
import practice.project.splitwise.exception.GroupNotFoundException;
import practice.project.splitwise.exception.UserNotFoundException;
import practice.project.splitwise.exception.UserNotMemberOfGroupException;

import java.util.List;

public interface GroupService {
    List<TransactionDTO> settleUpByGroupId(int groupId, int userId) throws UserNotFoundException, GroupNotFoundException, UserNotMemberOfGroupException;
    GroupCreationResponseDTO createGroup(GroupCreationDTO groupData);
    ExpenseResponseDTO addExpense(ExpenseReceivingDTO expenseData) throws UserNotFoundException, GroupNotFoundException, UserNotMemberOfGroupException;
    void groupSettled(SettledDTO settledDTO) throws UserNotFoundException, GroupNotFoundException, UserNotMemberOfGroupException;
    List<ExpenseDTO> getExpensesByFilter(Integer groupId, String category, String startDate, String endDate, String userEmail);
    List<GroupCreationResponseDTO> getAllGroupsForUser(String userEmail);
    void deleteGroup(int groupId, String userEmail) throws GroupNotFoundException, UserNotMemberOfGroupException;
    void addUserToGroup(Long userId, Long groupId) throws UserNotFoundException, GroupNotFoundException;
    boolean isUserInGroup(Long userId, Long groupId) throws UserNotFoundException, GroupNotFoundException;
    void markExpensesAsSettled(int groupId, int userId) throws GroupNotFoundException, UserNotFoundException;
}
