CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS staging_books;

CREATE TABLE staging_books (
    title TEXT,
    authors TEXT,
    image_url TEXT,
    categories TEXT,
    publisher TEXT,
    price TEXT,
    month TEXT,
    year TEXT
);

COPY staging_books
FROM '/datasets/BooksDatasetClean.csv'
WITH (
    FORMAT csv,
    HEADER true,
    DELIMITER ',',
    QUOTE '"',
    ESCAPE '"',
    ENCODING 'UTF8'
);

INSERT INTO publishers (publisher_id, name)
SELECT gen_random_uuid(), publisher
FROM (
    SELECT DISTINCT TRIM(publisher) AS publisher
    FROM staging_books
    WHERE publisher IS NOT NULL AND publisher <> ''
) s;

INSERT INTO authors (author_id, name)
SELECT gen_random_uuid(), author_name
FROM (
    SELECT DISTINCT TRIM(unnest(string_to_array(authors, ','))) AS author_name
    FROM staging_books
    WHERE authors IS NOT NULL
) s;

INSERT INTO categories (category_id, name)
SELECT gen_random_uuid(), category_name
FROM (
    SELECT DISTINCT TRIM(unnest(string_to_array(categories, ','))) AS category_name
    FROM staging_books
    WHERE categories IS NOT NULL
) s;

INSERT INTO books (book_id, title, description, publish_date, publisher_id)
SELECT gen_random_uuid(),
       sb.title,
       NULL,
       NULL,
       p.publisher_id
FROM (
    SELECT DISTINCT title, publisher
    FROM staging_books
) sb
LEFT JOIN publishers p
    ON TRIM(sb.publisher) = p.name;

INSERT INTO book_authors (book_id, author_id)
SELECT DISTINCT
    b.book_id,
    a.author_id
FROM staging_books sb
JOIN books b ON b.title = sb.title
JOIN LATERAL unnest(string_to_array(sb.authors, ',')) AS author_name ON TRUE
JOIN authors a ON TRIM(author_name) = a.name;

INSERT INTO book_categories (book_id, category_id)
SELECT DISTINCT
    b.book_id,
    c.category_id
FROM staging_books sb
JOIN books b ON b.title = sb.title
JOIN LATERAL unnest(string_to_array(sb.categories, ',')) AS category_name ON TRUE
JOIN categories c ON TRIM(category_name) = c.name;

INSERT INTO book_copies (copy_id, book_id, status)
SELECT gen_random_uuid(), book_id, 'AVAILABLE'
FROM books;

DROP TABLE staging_books;