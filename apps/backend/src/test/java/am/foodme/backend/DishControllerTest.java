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
class DishControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getActiveDishesForChef_returnsOnlyActiveDishes() throws Exception {
        mockMvc.perform(get("/api/dish/1/active").param("page", "0").param("size", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dishDtoList").isArray())
                .andExpect(jsonPath("$.count").value(2));
    }

    // KAN-7: search matches dish names in any language, case-insensitively.
    @Test
    void search_matchesDishNameCaseInsensitive() throws Exception {
        mockMvc.perform(get("/api/dish/search").param("query", "LAVASH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1))
                .andExpect(jsonPath("$.dishDtoList[0].id").value(1));
        mockMvc.perform(get("/api/dish/search").param("query", "Хашлама"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dishDtoList[0].id").value(2));
    }

    // KAN-7: search matches the dish's category/tag (e.g. "sushi" -> "Sushi and rolls"); inactive dishes excluded.
    @Test
    void search_matchesTagNameAndSkipsInactive() throws Exception {
        mockMvc.perform(get("/api/dish/search").param("query", "mains"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(2))
                .andExpect(jsonPath("$.dishDtoList[*].id").value(org.hamcrest.Matchers.containsInAnyOrder(2, 3)));
    }

    // Search text is bound as a parameter, never spliced into SQL.
    @Test
    void search_treatsQuoteAndWildcardsLiterally() throws Exception {
        mockMvc.perform(get("/api/dish/search").param("query", "' OR '1'='1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
        mockMvc.perform(get("/api/dish/search").param("query", "%"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }

    // FM-FLAKE-03
    @Test
    void getActiveDishesForChef_firstResultIsLavashWrap() throws Exception {
        mockMvc.perform(get("/api/dish/1/active").param("page", "0").param("size", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dishDtoList[0].nameEn").value("Lavash Wrap"));
    }
}
