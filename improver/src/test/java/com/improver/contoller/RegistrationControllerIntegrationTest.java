package com.improver.contoller;


import com.improver.controller.RegistrationController;
import com.improver.entity.Contractor;
import com.improver.entity.User;
import com.improver.model.in.registration.UserRegistration;
import com.improver.model.out.LoginModel;
import com.improver.repository.ContractorRepository;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import com.improver.util.serializer.SerializationUtil;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import javax.servlet.http.HttpServletResponse;

import static com.improver.application.properties.Path.CONTRACTORS;
import static com.improver.application.properties.Path.REGISTRATION_PATH;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/*@RunWith(SpringRunner.class)
@WebMvcTest(RegistrationController.class)*/
public class RegistrationControllerIntegrationTest {

    /*@Autowired private MockMvc mockMvc;

    @MockBean ContractorRepository contractorRepository;
    @MockBean MailService mailService;
    @MockBean UserSecurityService userSecurityService;


    private UserRegistration newContractor = new UserRegistration("test@contractor.com", "TestPass2018", "Jimm", "Vosniak", "333-222-4444");
    private Contractor contractor = new Contractor(newContractor);



    @Test
    public void positiveContractorRegistration() throws Exception {

        when(contractorRepository.save(any(Contractor.class))).thenReturn(contractor);
        doAnswer((contr) -> {System.out.println("Send email mock"); return null;})
            .when(mailService).sendRegistrationConfirmEmail(any(Contractor.class));

        UserRegistration newContractor = new UserRegistration("test@contractor.com", "TestPass2018", "Jimm", "Vosniak", "333-222-4444");

        mockMvc.perform(post(REGISTRATION_PATH + CONTRACTORS)
            .content(SerializationUtil.toJson(newContractor)).accept(MediaType.APPLICATION_JSON))

            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(header().exists("Authorization")

            );

    }*/

}
