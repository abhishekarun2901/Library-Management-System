package com.library.lbms.service.impl;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.library.lbms.dao.AuthorRepository;
import com.library.lbms.dao.BookRepository;
import com.library.lbms.dao.CategoryRepository;
import com.library.lbms.dao.PublisherRepository;
import com.library.lbms.dao.ReservationRepository;
import com.library.lbms.dao.specification.BookSpecification;
import com.library.lbms.dto.request.CreateBookRequest;
import com.library.lbms.dto.request.UpdateBookRequest;
import com.library.lbms.dto.response.BookResponse;
import com.library.lbms.entity.Author;
import com.library.lbms.entity.Book;
import com.library.lbms.entity.Category;
import com.library.lbms.entity.Copy;
import com.library.lbms.entity.Publisher;
import com.library.lbms.entity.enums.CopyStatus;
import com.library.lbms.exception.BadRequestException;
import com.library.lbms.exception.ResourceNotFoundException;
import com.library.lbms.service.BookService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final PublisherRepository publisherRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @CacheEvict(value = "categories", allEntries = true)
    public BookResponse createBook(CreateBookRequest request) {
        Publisher publisher = null;
        if (StringUtils.hasText(request.getPublisherName())) {
            publisher = publisherRepository.findByName(request.getPublisherName())
                    .orElseGet(() -> publisherRepository.save(Publisher.builder()
                            .publisherId(UUID.randomUUID())
                            .name(request.getPublisherName())
                            .build()));
        }

        Set<Author> authors = new HashSet<>();
        if (request.getAuthorNames() != null) {
            for (String authorName : request.getAuthorNames()) {
                Author author = authorRepository.findByName(authorName)
                        .orElseGet(() -> authorRepository.save(Author.builder()
                                .authorId(UUID.randomUUID())
                                .name(authorName)
                                .build()));
                authors.add(author);
            }
        }

        Set<Category> categories = new HashSet<>();
        if (request.getCategories() != null) {
            for (String categoryName : request.getCategories()) {
                Category category = categoryRepository.findByName(categoryName)
                        .orElseGet(() -> categoryRepository.save(Category.builder()
                                .categoryId(UUID.randomUUID())
                                .name(categoryName)
                                .build()));
                categories.add(category);
            }
        }

        Book book = Book.builder()
                .bookId(UUID.randomUUID())
                .title(request.getTitle())
                .isbn(request.getIsbn())
                .description(request.getDescription())
                .publishDate(request.getPublishDate())
                .createdAt(LocalDateTime.now())
                .isActive(true)
                .publisher(publisher)
                .authors(authors)
                .categories(categories)
                .copies(new HashSet<>())
                .build();

        if (request.getNumberOfCopies() != null && request.getNumberOfCopies() > 0) {
            for (int i = 0; i < request.getNumberOfCopies(); i++) {
                book.getCopies().add(Copy.builder()
                        .status(CopyStatus.AVAILABLE)
                        .book(book)
                        .build());
            }
        }

        return mapToResponse(bookRepository.save(book));
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public BookResponse updateBook(UUID id, UpdateBookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (StringUtils.hasText(request.getTitle())) book.setTitle(request.getTitle());
        if (StringUtils.hasText(request.getIsbn())) book.setIsbn(request.getIsbn());
        if (StringUtils.hasText(request.getDescription())) book.setDescription(request.getDescription());
        if (request.getPublishDate() != null) book.setPublishDate(request.getPublishDate());
        if (request.getIsActive() != null) book.setIsActive(request.getIsActive());

        if (StringUtils.hasText(request.getPublisherName())) {
            Publisher publisher = publisherRepository.findByName(request.getPublisherName())
                    .orElseGet(() -> publisherRepository.save(Publisher.builder()
                            .publisherId(UUID.randomUUID())
                            .name(request.getPublisherName())
                            .build()));
            book.setPublisher(publisher);
        }

        if (request.getAuthorNames() != null) {
            Set<Author> authors = new HashSet<>();
            for (String authorName : request.getAuthorNames()) {
                Author author = authorRepository.findByName(authorName)
                        .orElseGet(() -> authorRepository.save(Author.builder()
                                .authorId(UUID.randomUUID())
                                .name(authorName)
                                .build()));
                authors.add(author);
            }
            book.setAuthors(authors);
        }

        if (request.getCategories() != null) {
            Set<Category> categories = new HashSet<>();
            for (String categoryName : request.getCategories()) {
                Category category = categoryRepository.findByName(categoryName)
                        .orElseGet(() -> categoryRepository.save(Category.builder()
                                .categoryId(UUID.randomUUID())
                                .name(categoryName)
                                .build()));
                categories.add(category);
            }
            book.setCategories(categories);
        }

        return mapToResponse(bookRepository.save(book));
    }

    @Override
    public Page<BookResponse> getAllBooks(String title, String isbn, String author, String category, Pageable pageable) {
        return getAllBooks(title, isbn, author, category, null, pageable);
    }

    @Override
    public Page<BookResponse> getAllBooks(String title, String isbn, String author, String category, String search, Pageable pageable) {
        Specification<Book> spec = BookSpecification.filterBooks(title, isbn, author, category, search);
        return bookRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    public BookResponse getBookById(UUID id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        return mapToResponse(book);
    }

    @Override
    @Cacheable("categories")
    public java.util.List<String> getCategories() {
        return categoryRepository.findAll().stream()
                .map(Category::getName)
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public void deleteBook(UUID id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        boolean hasActiveLoans = book.getCopies().stream()
                .anyMatch(copy -> CopyStatus.ISSUED.equals(copy.getStatus()));

        if (hasActiveLoans) {
            throw new BadRequestException("Cannot delete book. One or more copies are currently on loan.");
        }

        book.setIsActive(false);
        bookRepository.save(book);
    }

    private BookResponse mapToResponse(Book book) {
        Set<String> authorNames = book.getAuthors() != null ?
                book.getAuthors().stream().map(Author::getName).collect(Collectors.toSet()) : new HashSet<>();

        Set<String> categoryNames = book.getCategories() != null ?
                book.getCategories().stream().map(Category::getName).collect(Collectors.toSet()) : new HashSet<>();

        long totalCopies = book.getCopies().size();
        long issuedCopies = book.getCopies().stream()
                .filter(c -> CopyStatus.ISSUED.equals(c.getStatus())).count();
        long lostCopies = book.getCopies().stream()
                .filter(c -> CopyStatus.LOST.equals(c.getStatus())).count();
        long activeHolds = reservationRepository.countByBook_BookIdAndStatus(book.getBookId(), "active");

        return BookResponse.builder()
                .bookId(book.getBookId())
                .title(book.getTitle())
                .description(book.getDescription())
                .publishDate(book.getPublishDate())
                .createdAt(book.getCreatedAt())
                .categories(categoryNames)
                .authors(authorNames)
                .publisher(book.getPublisher() != null ? book.getPublisher().getName() : null)
                .isActive(book.getIsActive())
                .trueAvailableStock(Math.max(0, totalCopies - issuedCopies - lostCopies - activeHolds))
                .build();
    }
}
