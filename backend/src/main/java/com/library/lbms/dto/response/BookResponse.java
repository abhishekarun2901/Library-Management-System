package com.library.lbms.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookResponse {
    private UUID bookId;
    private String title;
    private String description;
    private LocalDate publishDate;
    private LocalDateTime createdAt;
    private Set<String> categories;
    private String publisher;
    private Set<String> authors;  
    private Boolean isActive; 
    private Long trueAvailableStock; 
}