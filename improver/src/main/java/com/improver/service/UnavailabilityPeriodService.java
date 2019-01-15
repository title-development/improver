package com.improver.service;

import com.improver.entity.Company;
import com.improver.entity.UnavailabilityPeriod;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.repository.UnavailabilityPeriodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class UnavailabilityPeriodService {

    @Autowired private UnavailabilityPeriodRepository unavailabilityPeriodRepository;

    public List<UnavailabilityPeriod> getByCompany(Company company) {
        return unavailabilityPeriodRepository.getAllByCompany(company, LocalDate.now());
    }

    public void addUnavailabilityPeriod(Company company, UnavailabilityPeriod unavailabilityPeriod) {
        validate(unavailabilityPeriod);
        unavailabilityPeriodRepository.save(unavailabilityPeriod.setCompany(company));
    }

    public void updateUnavailabilityPeriod(Long id, UnavailabilityPeriod unavailabilityPeriod) {
        UnavailabilityPeriod period = unavailabilityPeriodRepository.findById(id).orElseThrow(NotFoundException::new);
        validate(unavailabilityPeriod);
        period.setFromDate(unavailabilityPeriod.getFromDate());
        period.setTillDate(unavailabilityPeriod.getTillDate());
        period.setReason(unavailabilityPeriod.getReason());
        unavailabilityPeriodRepository.save(period);
    }

    public void deleteUnavailabilityPeriod(Long id) {
        UnavailabilityPeriod period = unavailabilityPeriodRepository.findById(id).orElseThrow(NotFoundException::new);
        unavailabilityPeriodRepository.delete(period);
    }

    private void validate(UnavailabilityPeriod unavailabilityPeriod) {
        if(unavailabilityPeriod.getFromDate().isAfter(unavailabilityPeriod.getTillDate())) {
            throw new ValidationException("From date cannot be greater than till date");
        }
    }
}
