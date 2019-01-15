package com.improver.service;

import com.improver.entity.ServedZip;
import com.improver.repository.ServedZipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoverageService {
    @Autowired ServedZipRepository servedZipRepository;

    public void updateCoverage(List<String> zips) {
        List<String> existed = servedZipRepository.getAllServedZips();
        List<ServedZip> toDelete = existed.stream()
            .filter(zip -> !zips.contains(zip))
            .map(ServedZip::new)
            .collect(Collectors.toList());
        List<ServedZip> toUpdate = zips.stream()
            .filter(zip -> !existed.contains(zip))
            .map(ServedZip::new)
            .collect(Collectors.toList());
        servedZipRepository.deleteAll(toDelete);
        servedZipRepository.saveAll(toUpdate);
    }
}
