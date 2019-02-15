package com.improver.security;

import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.entity.User;
import com.improver.exception.AccessDeniedException;
import com.improver.repository.CompanyRepository;
import com.improver.repository.ContractorRepository;
import com.improver.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import javax.validation.constraints.NotNull;

@Component
public class SecurityHelper {


    @Autowired private UserRepository userRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private ContractorRepository contractorRepository;

    public boolean isSameUser(@NotNull Authentication auth, String email, long id) {
        if ( id == 0 && email == null)
            throw new IllegalArgumentException("Username/ID is missing. Incorrect annotation use.");
        String principalEmail = auth.getName().toLowerCase();
        User user = userRepository.findByEmail(principalEmail)
            .orElseThrow(AccessDeniedException::new);
        return principalEmail.equalsIgnoreCase(email) || user.getId() == id;
    }

    public boolean isCompanyMember(@NotNull Authentication auth, String companyId, String companyUri) {
        if (companyId == null && companyUri == null)
            throw new IllegalArgumentException("Company ID/URI is missing. Incorrect annotation use.");
        String principalEmail = auth.getName().toLowerCase();
        Company company = companyRepository.findByContractorEmail(principalEmail)
            .orElseThrow(AccessDeniedException::new);
        return company.getId().equals(companyId) || company.getUri().equals(companyUri);
    }


    public JwtPrincipal currentPrincipal(){
        return (JwtPrincipal)SecurityContextHolder.getContext().getAuthentication();
    }



}
