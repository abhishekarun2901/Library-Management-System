package com.library.lbms.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.library.lbms.dto.request.CopyRequest;
import com.library.lbms.dto.response.CopyResponse;
import com.library.lbms.service.CopyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/copies") 
@RequiredArgsConstructor
public class CopyController {

    private final CopyService copyService;

    @GetMapping
    public ResponseEntity<List<CopyResponse>> getCopies(@RequestParam(name = "book_id") UUID bookId) {
        return ResponseEntity.ok(copyService.getCopiesByBookId(bookId));
    }

    @PostMapping
    public ResponseEntity<CopyResponse> createCopy(
            @RequestParam(name = "book_id") UUID bookId, 
            @RequestBody CopyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(copyService.createCopy(bookId, request));
    }

    @PatchMapping("/{copy_id}")
    public ResponseEntity<CopyResponse> updateCopyStatus(
            @PathVariable("copy_id") UUID copyId, 
            @RequestBody CopyRequest request) {
        return ResponseEntity.ok(copyService.updateCopyStatus(copyId, request));
    }

    @DeleteMapping("/{copy_id}")
    public ResponseEntity<Void> deleteCopy(@PathVariable("copy_id") UUID copyId) {
        copyService.deleteCopy(copyId);
        return ResponseEntity.noContent().build();
    }
}