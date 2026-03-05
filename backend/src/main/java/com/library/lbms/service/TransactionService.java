package com.library.lbms.service;

import com.library.lbms.dto.request.TransactionRequest;
import com.library.lbms.dto.response.TransactionResponse;
import java.util.List;
import java.util.UUID;

public interface TransactionService {
    List<TransactionResponse> getAllTransactions();
    List<TransactionResponse> getUserTransactions(UUID userId); 
    TransactionResponse issueBook(TransactionRequest request);
    TransactionResponse updateTransaction(UUID transactionId, TransactionRequest request);
}