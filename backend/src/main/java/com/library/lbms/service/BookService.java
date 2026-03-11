package com.library.lbms.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.library.lbms.dto.request.CreateBookRequest;
import com.library.lbms.dto.request.UpdateBookRequest; 
import com.library.lbms.dto.response.BookResponse;

public interface BookService {
    BookResponse createBook(CreateBookRequest request);
    
    Page<BookResponse> getAllBooks(String title, String isbn, String author, String category, Pageable pageable);

    Page<BookResponse> getAllBooks(String title, String isbn, String author, String category, String search, Pageable pageable);
    
    BookResponse getBookById(UUID id);
    BookResponse updateBook(UUID id, UpdateBookRequest request);
    void deleteBook(UUID id);

    java.util.List<String> getCategories();
}
