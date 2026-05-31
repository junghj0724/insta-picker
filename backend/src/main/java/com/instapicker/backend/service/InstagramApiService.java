package com.instapicker.backend.service;

import com.instapicker.backend.dto.InstagramApiForm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class InstagramApiService {

    @Value("${instagram.api.token}")
    private String ACCESS_TOKEN;

    public List<InstagramApiForm> getMyPosts() {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://graph.instagram.com/v25.0/me/media?fields=id,caption,media_url,timestamp,comments_count&access_token=" + ACCESS_TOKEN;

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");

            // 가공된 데이터를 담을 DTO 리스트
            List<InstagramApiForm> processedPosts = new ArrayList<>();

            for (Map<String, Object> item : data) {
                // 데이터 꺼내기 및 예외 처리
                String id = item.get("id") != null ? item.get("id").toString() : "";

                String caption = item.get("caption") != null ? item.get("caption").toString() : "제목 없음";
                String title = caption.length() > 15 ? caption.substring(0, 15) + "..." : caption;

                String imageUrl = item.get("media_url") != null ? item.get("media_url").toString() : "";

                String timestamp = item.get("timestamp") != null ? item.get("timestamp").toString().substring(0, 10) : "날짜 없음";

                int commentCount = item.get("comments_count") != null ? Integer.parseInt(item.get("comments_count").toString()) : 0;

                InstagramApiForm form = new InstagramApiForm(
                        id,
                        title,
                        imageUrl,
                        timestamp,
                        commentCount
                );

                processedPosts.add(form);
            }
            return processedPosts;

        } catch (Exception e) {
            System.out.println("인스타 API 연동 중 에러 발생: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public Map<String, String> getUserProfile() {
        RestTemplate restTemplate = new RestTemplate();
        // 게시물(media)이 아니라 계정 자체(me)의 username을 달라고 요청하는 주소
        String url = "https://graph.instagram.com/v25.0/me?fields=id,username&access_token=" + ACCESS_TOKEN;

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            // 프론트엔드가 요구한 JSON 객체 형태 {"username": "실제계정명"} 로 만들기
            Map<String, String> result = new HashMap<>();
            result.put("username", response.get("username") != null ? response.get("username").toString() : "Unknown");

            return result;
        } catch (Exception e) {
            System.out.println("인스타 계정 정보 연동 중 에러 발생: " + e.getMessage());

            Map<String, String> errorResult = new HashMap<>();
            errorResult.put("username", "Error_User");
            return errorResult;
        }
    }
}