package com.improver.util;

import com.improver.entity.ServiceType;
import com.improver.entity.Staff;
import com.improver.entity.StaffAction;
import com.improver.entity.User;
import com.improver.repository.StaffActionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class StaffActionLogger {

    @Autowired private StaffActionRepository staffActionRepository;

    public void log(StaffAction.Action action, Staff author, String description) {
        staffActionRepository.save(new StaffAction(action, author, description));
    }

    public void logAddBonus(Staff author, String companyId, int amount){
        String description = String.format("Bonus for Company with id: %1$s. Amount: $%2$s.", companyId, amount / 100);
        this.log(StaffAction.Action.ADD_BONUS, author, description);
    }

    public void logCreateInvitation(Staff author, String [] emails, int amount){
        String description = String.format("Invitation for Contractors: %1$s. Amount: $%2$s.",
            Arrays.toString(emails), amount / 100);
        this.log(StaffAction.Action.CREATE_INVITATION, author, description);
    }

    public void logRemoveInvitation(Staff author, String email){
        String description = String.format("Invitation for Contractor with email: %1$s.", email);
        this.log(StaffAction.Action.REMOVE_INVITATION, author, description);
    }

    public void logLeadPriceChange(Staff author, long serviceTypeId, int amount){
        String description = String.format("Lead price of ServiceType with id %1$s is changed to: %2$s.",
            serviceTypeId, amount / 100);
        this.log(StaffAction.Action.CHANGE_LEAD_PRICE, author, description);
    }

    public void logCreateServiceType(Staff author, ServiceType serviceType){
        String description = String.format("Service type with id %1$s is created. %2$s with price %3$s.",
            serviceType.getId(), serviceType.getName(), serviceType.getLeadPrice());
        this.log(StaffAction.Action.CREATE_SERVICE_TYPE, author, description);
    }

    public void logRemoveServiceType(Staff author, ServiceType serviceType){
        String description = String.format("Service type with id %1$s is removed. %2$s with price %3$s.",
            serviceType.getId(), serviceType.getName(), serviceType.getLeadPrice());
        this.log(StaffAction.Action.REMOVE_SERVICE_TYPE, author, description);
    }

    public void logAccountUpdate(Staff author, User user){
        String description = String.format("User with id %1$s is updated. %2$s with email %3$s.",
            user.getId(), user.getName(), user.getEmail());
        this.log(StaffAction.Action.ACCOUNT_UPDATE, author, description);
    }

    public void logAccountDelete(Staff author, User user){
        String description = String.format("User with id %1$s is deleted. %2$s with email %3$s.",
            user.getId(), user.getName(), user.getEmail());
        this.log(StaffAction.Action.ACCOUNT_DELETE, author, description);
    }

}
