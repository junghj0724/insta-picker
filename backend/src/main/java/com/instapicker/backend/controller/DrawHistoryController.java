package com.instapicker.backend.controller;

import com.instapicker.backend.dto.DrawHistoryForm;
import com.instapicker.backend.entity.DrawHistoryEntity; // 임포트 변경
import com.instapicker.backend.service.DrawHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class DrawHistoryController {

    private final DrawHistoryService service;

    @GetMapping
    public List<DrawHistoryEntity> getHistory() {
        return service.getAllHistory();
    }

    @PostMapping
    public DrawHistoryEntity saveHistory(@RequestBody @Valid DrawHistoryForm form) {
        DrawHistoryEntity historyEntity = form.toEntity();
        return service.saveHistory(historyEntity);
    }
}