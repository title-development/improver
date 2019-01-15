package com.improver.controller;

import com.improver.entity.LicenseType;
import com.improver.enums.State;
import com.improver.repository.LicenseTypeRepository;
import com.improver.security.annotation.AdminAccess;
import com.improver.security.annotation.SupportAccess;
import com.improver.util.annotation.PageableSwagger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.improver.application.properties.Path.ID_PATH_VARIABLE;
import static com.improver.application.properties.Path.LICENSE_TYPE_PATH;

@Slf4j
@RestController
@RequestMapping(LICENSE_TYPE_PATH)
public class LicenseTypeController {

    @Autowired private LicenseTypeRepository licenseTypeRepository;


    @SupportAccess
    @GetMapping()
    @PageableSwagger
    public ResponseEntity<Page<LicenseType>> getAll(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String state,
        @RequestParam(required = false) String accreditation,
        @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageRequest) {
        Page<LicenseType> licenseTypes = licenseTypeRepository.getAll(id, state, accreditation, pageRequest);
        return new ResponseEntity<>(licenseTypes, HttpStatus.OK);
    }

    @GetMapping("/{state}")
    public ResponseEntity<List<LicenseType>> getAllByState(
        @PathVariable State state) {
        List<LicenseType> licenseTypes = licenseTypeRepository.findByStateOrderByAccreditation(state);
        return new ResponseEntity<>(licenseTypes, HttpStatus.OK);
    }

    @AdminAccess
    @DeleteMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteLicenseType(@PathVariable long id) {
        licenseTypeRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<Void> create(@RequestBody LicenseType licenseType) {
        licenseTypeRepository.save(licenseType);
        return new ResponseEntity<>(HttpStatus.OK);
    }


}
