package com.improver.contoller;

import com.improver.entity.Contractor;
import com.improver.model.in.registration.UserRegistration;
import com.improver.util.serializer.SerializationUtil;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MockMvcBuilder;
import org.springframework.test.web.servlet.setup.StandaloneMockMvcBuilder;
import org.springframework.web.context.WebApplicationContext;


import static com.improver.application.properties.Path.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


/*@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment= SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc*/
public class RegistrationControllerSystemTest {

/*    @Autowired private MockMvc mockMvc;
    @Autowired MockMvcBuilder mockMvcBuilder;



    @Test
    public void positiveContractorRegistration() throws Exception {
        UserRegistration newContractor = new UserRegistration("test@contractor.com", "TestPass2018", "Jimm", "Vosniak", "333-222-4444");

        mockMvc.perform(post(REGISTRATION_PATH + CONTRACTORS)
                .content(SerializationUtil.toJson(newContractor)).accept(MediaType.APPLICATION_JSON))

            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(header().exists("Authorization")

        );

    }*/
}
