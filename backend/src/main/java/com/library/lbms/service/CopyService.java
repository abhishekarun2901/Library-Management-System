package com.library.lbms.service;

import com.library.lbms.dto.request.CopyRequest;
import com.library.lbms.dto.response.CopyResponse;
import java.util.List;
import java.util.UUID;

public interface CopyService {
    void issueCopy(UUID copyId, UUID memberId);
    void returnCopy(UUID copyId);
    void markLost(UUID copyId);
    List<CopyResponse> getCopiesByBookId(UUID bookId);
    CopyResponse createCopy(UUID bookId, CopyRequest request);
    CopyResponse updateCopyStatus(UUID copyId, CopyRequest request);
    void deleteCopy(UUID copyId);
}