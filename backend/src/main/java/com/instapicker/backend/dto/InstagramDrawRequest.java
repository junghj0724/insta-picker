package com.instapicker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstagramDrawRequest {
    private String postId;
    private boolean excludeDuplicates;
    private String keyword;
    private int minTags;
    private int winnerCount;
    private boolean testMode; // 개발자 샌드박스 우회를 위한 시연용 테스트 모드 여부
}
