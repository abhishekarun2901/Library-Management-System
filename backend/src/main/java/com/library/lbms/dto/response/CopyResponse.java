package com.library.lbms.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class CopyResponse {
    private UUID copyId;
    private UUID bookId;
    private String status;
}