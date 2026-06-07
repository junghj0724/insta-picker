package com.instapicker.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InstagramCommentDto {
    private String id;
    private String username;
    private String text;
    private String timestamp;
}
