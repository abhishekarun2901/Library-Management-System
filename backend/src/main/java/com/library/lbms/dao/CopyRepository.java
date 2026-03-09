package com.library.lbms.dao;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.library.lbms.entity.Copy;
import com.library.lbms.entity.enums.CopyStatus;

public interface CopyRepository extends JpaRepository<Copy, UUID> {
    List<Copy> findByBook_BookId(UUID bookId);
    long countByStatus(CopyStatus status);
}