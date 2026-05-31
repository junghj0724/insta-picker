package com.instapicker.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DrawHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate drawDate;      // 추첨 날짜
    private String postTitle;        // 대상 게시물 제목
    private Integer commentCount;    // 총 댓글 수
    private String winnerUsername;   // 당첨자 아이디 목록
    private String status;           // 상태 (예: "완료")
}