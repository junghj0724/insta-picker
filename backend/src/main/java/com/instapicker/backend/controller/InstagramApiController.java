package com.instapicker.backend.controller;

import com.instapicker.backend.dto.InstagramApiForm;
import com.instapicker.backend.service.InstagramApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instagram")
@RequiredArgsConstructor
public class InstagramApiController {

    private final InstagramApiService instagramApiService;

    // 프론트엔드가 이 주소로 GET 요청을 보내면 진짜 인스타 게시물 목록을 응답!
    @GetMapping("/posts")
    public List<InstagramApiForm> getPosts() {
        return instagramApiService.getMyPosts();
    }

    @GetMapping("/user")
    public Map<String, String> getUserProfile() {
        return instagramApiService.getUserProfile(); // 방금 만든 서비스 메서드 호출
    }
}
