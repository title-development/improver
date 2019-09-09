package com.improver.service;

import com.improver.entity.Admin;
import com.improver.entity.ServedZip;
import com.improver.repository.ServedZipRepository;
import com.improver.util.StaffActionLogger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoverageService {

    @Autowired ServedZipRepository servedZipRepository;
    @Autowired StaffActionLogger staffActionLogger;

    public void updateCoverage(List<String> zips, Admin currentAdmin) {
        List<String> existed = servedZipRepository.getAllServedZips();

        List<String> zipCodesToDelete = existed.stream()
            .filter(zip -> !zips.contains(zip))
            .collect(Collectors.toList());

        List<ServedZip> toDelete = zipCodesToDelete.stream()
            .map(ServedZip::new)
            .collect(Collectors.toList());

        List<String> zipCodesToAdd = zips.stream()
            .filter(zip -> !existed.contains(zip))
            .collect(Collectors.toList());

        List<ServedZip> toAdd = zipCodesToAdd.stream()
            .map(ServedZip::new)
            .collect(Collectors.toList());

        servedZipRepository.deleteAll(toDelete);
        servedZipRepository.saveAll(toAdd);
        staffActionLogger.logCoverageUpdate(currentAdmin, zipCodesToDelete, zipCodesToAdd);
    }
}
