package com.instapicker.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor // 💡 모든 필드를 받는 생성자를 자동으로 만들어줍니다.
public class InstagramApiForm {
    private String id;
    private String title;
    private String imageUrl;
    private String postDate;
    private int commentCount;
}