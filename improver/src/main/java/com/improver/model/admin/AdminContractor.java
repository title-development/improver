package com.improver.model.admin;

import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.entity.User;
import com.improver.model.NameUuidTuple;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AdminContractor extends User {
    private boolean quickReply;
    private NameUuidTuple company;

    public AdminContractor(Contractor contractor, Company company) {
        this.id = contractor.getId();
        this.role = contractor.getRole();
        this.email = contractor.getEmail();
        this.firstName = contractor.getFirstName();
        this.lastName = contractor.getLastName();
        this.displayName = contractor.getDisplayName();
        this.iconUrl = contractor.getIconUrl();
        this.internalPhone = contractor.getInternalPhone();
        this.isActivated = contractor.isActivated();
        this.isBlocked = contractor.isBlocked();
        this.isDeleted = contractor.isDeleted();
        this.quickReply = contractor.isQuickReply();
        this.lastLogin = contractor.getLastLogin();
        this.updated = contractor.getUpdated();
        this.created = contractor.getCreated();
        this.company = new NameUuidTuple(company.getId(), company.getName());
    }
}
