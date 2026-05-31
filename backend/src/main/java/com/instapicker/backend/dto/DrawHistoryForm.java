package com.instapicker.backend.dto;

import com.instapicker.backend.entity.DrawHistoryEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class DrawHistoryForm {

    // 프론트엔드에서 반드시 보내야 하는 값들 (Validation 적용!)
    @NotBlank(message = "게시물 제목은 필수입니다.")
    private String postTitle;

    @NotNull(message = "댓글 수는 필수입니다.")
    private Integer commentCount;

    @NotBlank(message = "당첨자 목록은 필수입니다.")
    private String winnerUsername;

    // DTO(택배 상자)를 Entity(DB 거울)로 변환해 주는 메서드
    public DrawHistoryEntity toEntity() {
        return new DrawHistoryEntity(
                null,
                LocalDate.now(),
                this.postTitle,
                this.commentCount,
                this.winnerUsername,
                "완료"
        );
    }
}