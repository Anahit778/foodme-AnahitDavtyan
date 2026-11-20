package am.foodme.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ChefControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getActiveChefs_returnsActiveChefsOnly() throws Exception {
        mockMvc.perform(get("/api/chef/active").param("page", "0").param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exploreChefResponseDtoList").isArray())
                .andExpect(jsonPath("$.count").value(2));
    }

    // KAN-5 / FM-BUG-02: the last chef on the final page must not be dropped.
    @Test
    void getActiveChefs_returnsEveryCountedChef() throws Exception {
        mockMvc.perform(get("/api/chef/active").param("page", "0").param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2))
                .andExpect(jsonPath("$.exploreChefResponseDtoList.length()").value(2))
                .andExpect(jsonPath("$.exploreChefResponseDtoList[1].id").value(2));
    }

    @Test
    void getActiveChefs_pagingCoversAllChefs() throws Exception {
        mockMvc.perform(get("/api/chef/active").param("page", "1").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exploreChefResponseDtoList.length()").value(1))
                .andExpect(jsonPath("$.exploreChefResponseDtoList[0].id").value(2));
    }

    @Test
    void getChefById_returnsChefWithDishes() throws Exception {
        mockMvc.perform(get("/api/chef/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.username").value("marta-k"))
                .andExpect(jsonPath("$.dishes").isArray());
    }
}
