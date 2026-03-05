package com.library.lbms.controller;

import com.library.lbms.dto.response.FineResponse;
import com.library.lbms.service.FineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/fines") 
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;

    @GetMapping
    public ResponseEntity<List<FineResponse>> getAllFines() {
        return ResponseEntity.ok(fineService.getAllFines());
    }

    @PatchMapping("/{fine_id}")
    public ResponseEntity<Void> payFine(@PathVariable UUID fine_id) {
        fineService.payFine(fine_id);
        return ResponseEntity.ok().build();
    }
}