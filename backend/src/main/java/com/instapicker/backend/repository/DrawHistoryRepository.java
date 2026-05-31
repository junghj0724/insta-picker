package com.instapicker.backend.repository;

import com.instapicker.backend.entity.DrawHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DrawHistoryRepository extends JpaRepository<DrawHistoryEntity, Long> {
}