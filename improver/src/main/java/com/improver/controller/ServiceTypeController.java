package com.improver.controller;


import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.model.NameIdTuple;
import com.improver.model.admin.AdminServiceType;
import com.improver.repository.ServiceTypeRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.AdminAccess;
import com.improver.security.annotation.StaffAccess;
import com.improver.security.annotation.SupportAccess;
import com.improver.service.ServiceTypeService;
import com.improver.util.annotation.PageableSwagger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static com.improver.application.properties.Path.*;
import static com.improver.util.serializer.SerializationUtil.fromJson;


@RestController
@RequestMapping(SERVICES_PATH)
public class ServiceTypeController {

    @Autowired private ServiceTypeService serviceTypeService;
    @Autowired private UserSecurityService userSecurityService;


    @SupportAccess
    @GetMapping()
    @PageableSwagger
    public ResponseEntity<Page<AdminServiceType>> getAllServices(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String description,
        @RequestParam(required = false) String labels,
        @RequestParam(required = false) String tradeName,
        @RequestParam(required = false) Integer leadPriceFrom,
        @RequestParam(required = false) Integer leadPriceTo,
        @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageRequest) {
        Page<AdminServiceType> services = serviceTypeService.getAllServiceTypes(id, name, description, labels, tradeName, leadPriceFrom, leadPriceTo, pageRequest);

        return new ResponseEntity<>(services, HttpStatus.OK);
    }

    @SupportAccess
    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<AdminServiceType> getServiceTypeById(@PathVariable long id) {
        AdminServiceType adminServiceType = serviceTypeService.getServiceTypeById(id);

        return new ResponseEntity<>(adminServiceType, HttpStatus.OK);
    }

    @AdminAccess
    @PutMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> updatedServiceType(@PathVariable long id,
                                                   @RequestPart(value = "data") String data,
                                                   @RequestPart(value = "file", required = false) MultipartFile image) {
        AdminServiceType adminServiceType = fromJson(new TypeReference<>() {
        }, data);
        serviceTypeService.updateServiceType(id, adminServiceType, image, userSecurityService.currentAdmin());

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @PostMapping
    public ResponseEntity<Void> createServiceType(@RequestPart(value = "data") String data,
                                                  @RequestPart(value = "file", required = false) MultipartFile image) {
        AdminServiceType adminServiceType = fromJson(new TypeReference<>() {
        }, data);
        serviceTypeService.addServiceType(adminServiceType, image, userSecurityService.currentAdmin());

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @DeleteMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteServiceType(@PathVariable long id) {
        serviceTypeService.deleteServiceType(id, userSecurityService.currentAdmin());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @StaffAccess
    @GetMapping(IS_NAME_FREE)
    public ResponseEntity<Void> isNameFree(@RequestParam String serviceName) {

        return new ResponseEntity<>(serviceTypeService.isNameFree(serviceName) ? HttpStatus.OK : HttpStatus.CONFLICT);
    }


    @SupportAccess
    @GetMapping("/with-questionary")
    public ResponseEntity<List<List<NameIdTuple>>> getSortedByQuestionaryExist() {
        List<List<NameIdTuple>> services = serviceTypeService.getSortedByQuestionaryExist();

        return new ResponseEntity<>(services, HttpStatus.OK);
    }


}
