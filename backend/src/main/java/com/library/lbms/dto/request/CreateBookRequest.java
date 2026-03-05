package com.library.lbms.dto.request;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class CreateBookRequest {
    private String title;
    private String isbn; 
    private String description;
    private LocalDate publishDate;
    private Set<String> categories; 
    private Integer numberOfCopies;
    private String publisherName;
    private Set<String> authorNames; 
}