package com.improver.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.improver.entity.Admin;
import com.improver.entity.ServedZip;
import com.improver.exception.ThirdPartyException;
import com.improver.model.admin.in.ServedAreasUpdate;
import com.improver.repository.ServedZipRepository;
import com.improver.util.StaffActionLogger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import static java.util.Objects.nonNull;

@Slf4j
@Service
public class CoverageService {

    @Autowired ServedZipRepository servedZipRepository;
    @Autowired StaffActionLogger staffActionLogger;
    @Autowired BoundariesService boundariesService;

    public void updateZipCodesCoverage(List<String> zips, Admin currentAdmin) {
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

    public void updateCountiesCoverage(ServedAreasUpdate servedAreasUpdate, Admin currentAdmin) throws ThirdPartyException, InterruptedException {
        AtomicReference<String> requestFailMessage = new AtomicReference<>();
        JsonNode zipCodesToDelete = boundariesService.getZipCodesByCounties(servedAreasUpdate.getRemoved().toArray(new String[0]));
        List<String> toDelete = new ArrayList<>();
        zipCodesToDelete.get("features").forEach(f -> toDelete.add(f.get("id").asText()));

        Set<ServedZip> toAdd = new CopyOnWriteArraySet<>();
        List<Callable<AbstractMap.SimpleEntry<String, JsonNode>>> requests = new ArrayList<>();

        for (String added : servedAreasUpdate.getAdded()) {
            requests.add(() -> new AbstractMap.SimpleEntry<>(added, boundariesService.getZipCodesByCounties(added)));
        }

        ExecutorService executor = Executors.newWorkStealingPool();

        executor.invokeAll(requests)
            .parallelStream()
            .map(future -> {
                try {
                    return future.get();
                }
                catch (Exception e) {
                    requestFailMessage.set(e.getMessage());
                    log.error(e.getMessage());
                    return null;
                }
            })
            .filter(Objects::nonNull)
            .forEach(entry -> {
                String countyId = entry.getKey();
                JsonNode zipCodesToAdd = entry.getValue();
                zipCodesToAdd.get("features").forEach(f -> toAdd.add(new ServedZip(f.get("id").asText(), countyId)));
            });

        if (nonNull(requestFailMessage.get())) {
            throw new ThirdPartyException(requestFailMessage.get());
        }

        servedZipRepository.deleteByZipIn(toDelete);
        servedZipRepository.saveAll(toAdd);
        staffActionLogger.logCoverageUpdate(currentAdmin, servedAreasUpdate.getRemoved(), servedAreasUpdate.getAdded());
    }

}
