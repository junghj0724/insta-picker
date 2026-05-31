package com.instapicker.backend.service;

import com.instapicker.backend.entity.DrawHistoryEntity;
import com.instapicker.backend.repository.DrawHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DrawHistoryService {

    private final DrawHistoryRepository repository;

    public List<DrawHistoryEntity> getAllHistory() {
        return repository.findAll();
    }

    public DrawHistoryEntity saveHistory(DrawHistoryEntity historyEntity) {
        return repository.save(historyEntity);
    }
}