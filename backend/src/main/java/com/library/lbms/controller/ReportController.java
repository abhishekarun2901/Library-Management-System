package com.library.lbms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.library.lbms.dto.response.ReportResponse;
import com.library.lbms.service.ReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ReportResponse> getSystemAnalytics() {
        return ResponseEntity.ok(reportService.getSystemAnalytics());
    }
}