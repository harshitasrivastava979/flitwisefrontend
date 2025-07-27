package practice.project.splitwise.model;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Expense extends BaseModel {
    private double amount;
    private String description;
    private Settled isSettled;
    private String splitType; // EQUAL, PERCENTAGE, EXACT, SHARES
    private String category; // e.g., food, travel, etc.
    private String notes;
    private Date timestamp;
   // private boolean recurring;
   // private String interval; // e.g., daily, weekly, monthly
   // private Date nextDueDate;


    private Boolean recurring;


    private String interval;


    private Date nextDueDate;

    @ManyToOne
    private Users paidBy;


    @OneToMany
    private List<UsersSplit> amountSplit;

    public Expense(double amount, String description, Users paidBy) {
        this.amount = amount;
        this.description = description;
        this.paidBy = paidBy;
        ArrayList<UsersSplit> newUserSplit = new ArrayList<>();
        newUserSplit.add(new UsersSplit(paidBy, amount, null, null));
        this.amountSplit = newUserSplit;
    }


    /**
     * @param users list of users among whom we have to split equally
     * @return a complete expense object
     */
    public Expense splitEqually(List<Users> users) {
        int totalSplits = users.size();
        double eachSplitAmount = this.getAmount() / totalSplits;

        List<UsersSplit> usersSplits = new ArrayList<>();
        usersSplits.add(new UsersSplit(paidBy, amount, null, null));
        for (Users u : users) {
            usersSplits.add(new UsersSplit(u, -eachSplitAmount, null, null));
        }
        this.setAmountSplit(usersSplits);
        return this;
    }
}
