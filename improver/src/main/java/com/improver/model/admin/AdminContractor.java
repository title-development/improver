package com.improver.model.admin;

import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.model.NameIdTuple;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@NoArgsConstructor
public class AdminContractor extends UserModel {
    private Boolean isQuickReply;
    private NameIdTuple company;

    public AdminContractor(Contractor contractor, Company company) {
        super(contractor);
        this.isQuickReply = contractor.isQuickReply();
        this.company = new NameIdTuple(company.getId(), company.getName());
    }
}
