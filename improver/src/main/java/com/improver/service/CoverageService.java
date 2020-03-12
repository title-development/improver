package com.improver.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.improver.entity.Admin;
import com.improver.entity.Centroid;
import com.improver.entity.ServedZip;
import com.improver.exception.ThirdPartyException;
import com.improver.model.admin.in.ServedAreasUpdate;
import com.improver.repository.ServedZipRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import static java.util.Objects.nonNull;

@Slf4j
@Service
public class CoverageService {

    @Autowired ServedZipRepository servedZipRepository;
    @Autowired StaffActionLogger staffActionLogger;
    @Autowired BoundariesService boundariesService;
    @Autowired ExecutorService executorService;

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

        if (!servedAreasUpdate.getRemoved().isEmpty()) {
            JsonNode zipCodesToDelete = boundariesService.getZipCodesByCounties(servedAreasUpdate.getRemoved().toArray(new String[0]));
            List<String> toDelete = new ArrayList<>();
            zipCodesToDelete.get("features")
                .forEach(f -> toDelete.add(f.get("id").asText()));
            servedZipRepository.deleteByZipIn(toDelete);
        }

        if (!servedAreasUpdate.getAdded().isEmpty()) {
            Set<ServedZip> toAdd = new CopyOnWriteArraySet<>();
            List<Callable<AbstractMap.SimpleEntry<String, JsonNode>>> requests = new ArrayList<>();

            for (String added : servedAreasUpdate.getAdded()) {
                requests.add(() -> new AbstractMap.SimpleEntry<>(added, boundariesService.getZipCodesByCounties(added)));
            }

            AtomicReference<String> requestFailMessage = new AtomicReference<>();
            executorService.invokeAll(requests)
                .parallelStream()
                .map(future -> {
                    try {
                        return future.get();
                    } catch (Exception e) {
                        requestFailMessage.set(e.getMessage());
                        log.error(e.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .forEach(zipCodesToAdd -> {
                    String countyId = zipCodesToAdd.getKey();
                    zipCodesToAdd.getValue().get("features")
                        .forEach(feature -> {
                            Iterator<JsonNode> coordinates = feature.get("properties").get("centroid").get("coordinates").elements();
                            Centroid centroid = new Centroid().setLng(coordinates.next().asDouble())
                                .setLat(coordinates.next().asDouble());
                            toAdd.add(new ServedZip(feature.get("id").asText(), countyId, centroid));
                        });
                });

            if (nonNull(requestFailMessage.get())) {
                throw new ThirdPartyException(requestFailMessage.get());
            }
            servedZipRepository.saveAll(toAdd);
        }
        staffActionLogger.logCoverageUpdate(currentAdmin, servedAreasUpdate.getRemoved(), servedAreasUpdate.getAdded());
    }

}
