package com.library.lbms.dao.specification;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.library.lbms.entity.Author;
import com.library.lbms.entity.Book;
import com.library.lbms.entity.Category;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import java.util.Arrays;
import java.util.List;

public class BookSpecification {

    public static Specification<Book> filterBooks(String title, String isbn, String author, String category) {
        return filterBooks(title, isbn, author, category, null);
    }

    public static Specification<Book> filterBooks(String title, String isbn, String author, String category, String search) {
        return (root, query, cb) -> {
            Specification<Book> spec = Specification.allOf();

            // 'search' matches title OR author name (used by catalog search bar)
            if (StringUtils.hasText(search)) {
                spec = spec.and((r, q, c) -> {
                    q.distinct(true);
                    Join<Book, Author> authorJoin = r.join("authors", JoinType.LEFT);
                    return c.or(
                        c.like(c.lower(r.get("title")), "%" + search.toLowerCase() + "%"),
                        c.like(c.lower(authorJoin.get("name")), "%" + search.toLowerCase() + "%")
                    );
                });
            }

            // Backward-compatible title search: title OR isbn
            if (StringUtils.hasText(title)) {
                spec = spec.and((r, q, c) -> 
                    c.or(
                        c.like(c.lower(r.get("title")), "%" + title.toLowerCase() + "%"),
                        c.like(c.lower(r.get("isbn")), "%" + title.toLowerCase() + "%")
                    )
                );
            }

            // Dedicated ISBN search parameter
            if (StringUtils.hasText(isbn)) {
                spec = spec.and((r, q, c) ->
                        c.like(c.lower(r.get("isbn")), "%" + isbn.toLowerCase() + "%"));
            }

            // Filter by Author Name
            if (StringUtils.hasText(author)) {
                spec = spec.and((r, q, c) -> {
                    q.distinct(true);
                    Join<Book, Author> authorJoin = r.join("authors", JoinType.INNER);
                    return c.like(c.lower(authorJoin.get("name")), "%" + author.toLowerCase() + "%");
                });
            }

            // Filter by Category Name (supports single or comma-separated values)
            if (StringUtils.hasText(category)) {
                List<String> categoryTokens = Arrays.stream(category.split(","))
                        .map(String::trim)
                        .filter(StringUtils::hasText)
                        .map(String::toLowerCase)
                        .toList();

                spec = spec.and((r, q, c) -> {
                    q.distinct(true);
                    Join<Book, Category> categoryJoin = r.join("categories", JoinType.INNER);
                    if (categoryTokens.isEmpty()) {
                        return c.conjunction();
                    }
                    Predicate[] categoryPredicates = categoryTokens.stream()
                            .map(token -> c.like(c.lower(categoryJoin.get("name")), "%" + token + "%"))
                            .toArray(Predicate[]::new);
                    return c.or(categoryPredicates);
                });
            }

            // Only show active books
            spec = spec.and((r, q, c) -> c.isTrue(r.get("isActive")));

            return spec.toPredicate(root, query, cb);
        };
    }
}
