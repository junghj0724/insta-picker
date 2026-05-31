package com.instapicker.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class InstagramApiService {

    @Value("${instagram.api.token}")
    private String ACCESS_TOKEN;

    public List<Map<String, Object>> getMyPosts() {
        RestTemplate restTemplate = new RestTemplate();
        // 토큰은 위에서 안전하게 주입받은 ACCESS_TOKEN을 그대로 사용합니다.
        String url = "https://graph.instagram.com/me/media?fields=id,caption,media_url,timestamp&access_token=" + ACCESS_TOKEN;

        try {
            // 1. 인스타 API 찌르기
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");

            // 2. 데이터 가공하기
            List<Map<String, Object>> processedPosts = new ArrayList<>();
            for (Map<String, Object> item : data) {
                Map<String, Object> post = new HashMap<>();
                post.put("id", item.get("id"));

                String caption = item.get("caption") != null ? item.get("caption").toString() : "제목 없음";
                post.put("title", caption.length() > 15 ? caption.substring(0, 15) + "..." : caption);
                post.put("imageUrl", item.get("media_url"));

                String timestamp = item.get("timestamp") != null ? item.get("timestamp").toString().substring(0, 10) : "날짜 없음";
                post.put("postDate", timestamp);
                post.put("commentCount", 0);

                processedPosts.add(post);
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
        String url = "https://graph.instagram.com/me?fields=id,username&access_token=" + ACCESS_TOKEN;

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