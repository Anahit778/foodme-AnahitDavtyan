package am.foodme.backend.repository;

import am.foodme.backend.model.Dish;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Locale;

@Repository
public class DishSearchRepositoryImpl implements DishSearchRepository {

    // Matches active dishes by name (any language) or by their tag/category name
    // (e.g. "sushi" -> "Sushi and rolls"). The search text is always bound as a parameter.
    private static final String WHERE =
            " FROM Dish d LEFT JOIN d.dishTag t WHERE d.status = 'ACTIVE' AND ("
                    + " LOWER(d.nameEn) LIKE :q ESCAPE '\\' OR LOWER(d.nameAm) LIKE :q ESCAPE '\\'"
                    + " OR LOWER(d.nameRu) LIKE :q ESCAPE '\\' OR LOWER(t.nameEn) LIKE :q ESCAPE '\\'"
                    + " OR LOWER(t.nameAm) LIKE :q ESCAPE '\\' OR LOWER(t.nameRu) LIKE :q ESCAPE '\\')";

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<Dish> searchByNameNative(String searchTerm, Pageable pageable) {
        String pattern = "%" + escapeLike(searchTerm.trim().toLowerCase(Locale.ROOT)) + "%";

        List<Dish> results = entityManager
                .createQuery("SELECT d" + WHERE + " ORDER BY d.id", Dish.class)
                .setParameter("q", pattern)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        long total = entityManager
                .createQuery("SELECT COUNT(d)" + WHERE, Long.class)
                .setParameter("q", pattern)
                .getSingleResult();

        return new PageImpl<>(results, pageable, total);
    }

    private static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
