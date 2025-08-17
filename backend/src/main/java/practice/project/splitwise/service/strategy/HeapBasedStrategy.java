package practice.project.splitwise.service.strategy;

import practice.project.splitwise.dto.TransactionDTO;
import practice.project.splitwise.model.Expense;
import practice.project.splitwise.model.Users;
import practice.project.splitwise.model.UsersSplit;

import java.util.*;

public class HeapBasedStrategy implements SettleUpStrategy {
    @Override
    public List<TransactionDTO> settleUp(List<Expense> expenses) {
        List<TransactionDTO> transactions = new ArrayList<>();
        HashMap<Users, Double> individualAmounts = new HashMap<>();

        // Calculate net balance for each user
        for (Expense expense : expenses) {
            for (UsersSplit userSplit : expense.getAmountSplit()) {
                individualAmounts.merge(userSplit.getUser(), userSplit.getAmount(), Double::sum);
            }
        }

        // MaxHeap -> users who are owed money (positive balance)
        PriorityQueue<Map.Entry<Users, Double>> maxHeap = new PriorityQueue<>(
                (a, b) -> Double.compare(b.getValue(), a.getValue())
        );

        // MinHeap -> users who owe money (negative balance)
        PriorityQueue<Map.Entry<Users, Double>> minHeap = new PriorityQueue<>(
                Comparator.comparingDouble(Map.Entry::getValue)
        );

        // Populate heaps
        for (Map.Entry<Users, Double> entry : individualAmounts.entrySet()) {
            if (Math.abs(entry.getValue()) < 0.01) { // Handle floating point precision
                System.out.println(entry.getKey().getName() + " is already settled up");
            } else if (entry.getValue() < 0) {
                minHeap.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            } else {
                maxHeap.add(new AbstractMap.SimpleEntry<>(entry.getKey(), entry.getValue()));
            }
        }

        // Process settlements
        while (!minHeap.isEmpty() && !maxHeap.isEmpty()) {
            Map.Entry<Users, Double> debtor = minHeap.poll();
            Map.Entry<Users, Double> creditor = maxHeap.poll();

            double debtAmount = Math.abs(debtor.getValue());
            double creditAmount = creditor.getValue();
            double settleAmount = Math.min(debtAmount, creditAmount);

            TransactionDTO transaction = new TransactionDTO(
                    debtor.getKey().getId().intValue(),
                    debtor.getKey().getName(),
                    creditor.getKey().getId().intValue(),
                    creditor.getKey().getName(),
                    settleAmount,
                    "Settlement for group expenses",
                    "PENDING",
                    new java.util.Date().toString()
            );
            transactions.add(transaction);

            // Update remaining amounts
            double remainingDebt = debtAmount - settleAmount;
            double remainingCredit = creditAmount - settleAmount;

            if (remainingDebt > 0.01) {
                minHeap.add(new AbstractMap.SimpleEntry<>(debtor.getKey(), -remainingDebt));
            }

            if (remainingCredit > 0.01) {
                maxHeap.add(new AbstractMap.SimpleEntry<>(creditor.getKey(), remainingCredit));
            }
        }

        return transactions;
    }
}