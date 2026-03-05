package com.library.lbms.dao;

import com.library.lbms.entity.Copy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CopyRepository extends JpaRepository<Copy, UUID> {
    List<Copy> findByBook_BookId(UUID bookId);
}