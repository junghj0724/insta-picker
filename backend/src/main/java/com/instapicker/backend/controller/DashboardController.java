package com.instapicker.backend.controller;

import com.instapicker.backend.entity.DrawHistoryEntity;
import com.instapicker.backend.service.DrawHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DrawHistoryService drawHistoryService;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        List<DrawHistoryEntity> historyList = drawHistoryService.getAllHistory();

        int totalDraws = historyList.size();
        int totalWinners = 0;

        for (DrawHistoryEntity history : historyList) {
            String winners = history.getWinnerUsername();
            if (winners != null && !winners.trim().isEmpty()) {
                String[] split = winners.split(",");
                for (String s : split) {
                    if (s != null && !s.trim().isEmpty()) {
                        totalWinners++;
                    }
                }
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("connectedAccounts", 1); // 기본 1개 연동으로 표시
        stats.put("totalDraws", totalDraws);
        stats.put("totalWinners", totalWinners);

        return stats;
    }
}
