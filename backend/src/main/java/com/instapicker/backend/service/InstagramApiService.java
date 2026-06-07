package com.instapicker.backend.service;

import com.instapicker.backend.dto.InstagramApiForm;
import com.instapicker.backend.dto.InstagramCommentDto;
import com.instapicker.backend.dto.InstagramDrawRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

            List<InstagramApiForm> processedPosts = new ArrayList<>();

            for (Map<String, Object> item : data) {
                String id = item.get("id") != null ? item.get("id").toString() : "";
                String caption = item.get("caption") != null ? item.get("caption").toString() : "제목 없음";
                String title = caption.length() > 15 ? caption.substring(0, 15) + "..." : caption;
                String imageUrl = item.get("media_url") != null ? item.get("media_url").toString() : "";
                String timestamp = item.get("timestamp") != null ? item.get("timestamp").toString().substring(0, 10) : "날짜 없음";
                int commentCount = item.get("comments_count") != null ? Integer.parseInt(item.get("comments_count").toString()) : 0;

                InstagramApiForm form = new InstagramApiForm(id, title, imageUrl, timestamp, commentCount);
                processedPosts.add(form);
            }
            return processedPosts;

        } catch (Exception e) {
            System.out.println("인스타 API 게시물 조회 중 에러 발생: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public Map<String, String> getUserProfile() {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://graph.instagram.com/v25.0/me?fields=id,username&access_token=" + ACCESS_TOKEN;

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

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

    /**
     * 댓글을 수집하고, 설정된 필터 조건에 따라 필터링 후 무작위로 당첨자를 추첨합니다.
     */
    public List<InstagramCommentDto> drawWinners(InstagramDrawRequest request) {
        System.out.println("[DrawWinners] 추첨 요청 파라미터 - PostId: " + request.getPostId() 
            + ", ExcludeDuplicates: " + request.isExcludeDuplicates()
            + ", Keyword: '" + request.getKeyword() + "'"
            + ", MinTags: " + request.getMinTags()
            + ", WinnerCount: " + request.getWinnerCount()
            + ", TestMode: " + request.isTestMode());

        // 1. 댓글 수집 (테스트 모드 여부에 따라 분기)
        List<InstagramCommentDto> comments;
        if (request.isTestMode()) {
            comments = getDemoComments();
            System.out.println("[DrawWinners] [테스트 모드] 시연용 가상 댓글 로드 수: " + comments.size());
        } else {
            comments = getAllComments(request.getPostId());
            System.out.println("[DrawWinners] [실제 API] 수집된 실시간 댓글 수: " + comments.size());
        }

        // 2. 필터링 수행
        List<InstagramCommentDto> filteredComments = filterComments(comments, request);
        System.out.println("[DrawWinners] 필터링 후 남은 댓글 수: " + filteredComments.size());

        // 3. 무작위 추첨 수행 및 반환
        List<InstagramCommentDto> winners = pickRandomWinners(filteredComments, request.getWinnerCount());
        System.out.println("[DrawWinners] 최종 당첨자 수: " + winners.size());

        return winners;
    }

    /**
     * 개발 단계 시연 및 API 제약 우회를 위한 가상 데모 댓글을 생성합니다.
     */
    private List<InstagramCommentDto> getDemoComments() {
        List<InstagramCommentDto> demoComments = new ArrayList<>();
        demoComments.add(new InstagramCommentDto("d1", "chulsoo_kim", "우와 신기한 추첨기네요! #참여완료 @friend1", "2026-06-07T10:00:00Z"));
        demoComments.add(new InstagramCommentDto("d2", "minji_stargram", "꼭 당첨되고 싶어요!!! #참여완료 @chulsoo_kim @friend2", "2026-06-07T10:01:00Z"));
        demoComments.add(new InstagramCommentDto("d3", "hyejin_lee", "이벤트 참여합니다 #참여완료 @younghee_park", "2026-06-07T10:02:00Z"));
        demoComments.add(new InstagramCommentDto("d4", "younghee_park", "인스타 피커 최고! 디자인 진짜 예쁘네요 #참여완료", "2026-06-07T10:03:00Z"));
        demoComments.add(new InstagramCommentDto("d5", "donghyun_99", "친구야 이거 봐라 @chulsoo_kim #참여완료 @friend3 @friend4", "2026-06-07T10:04:00Z"));
        demoComments.add(new InstagramCommentDto("d6", "sohee_park", "당첨 가즈아아아 #참여완료", "2026-06-07T10:05:00Z"));
        demoComments.add(new InstagramCommentDto("d7", "taeho_j", "참여합니다! 대박나세요 @hyejin_lee #참여완료", "2026-06-07T10:06:00Z"));
        demoComments.add(new InstagramCommentDto("d8", "jiwon_choi", "인터페이스가 아주 동적이고 프리미엄하네요! #참여완료", "2026-06-07T10:07:00Z"));
        demoComments.add(new InstagramCommentDto("d9", "junho_lim", "같이 신청하자 @donghyun_99 #참여완료", "2026-06-07T10:08:00Z"));
        demoComments.add(new InstagramCommentDto("d10", "yuna_song", "당첨시켜주시면 후기 예쁘게 남길게요! #참여완료 @star_user", "2026-06-07T10:09:00Z"));
        return demoComments;
    }

    /**
     * 특정 게시글의 모든 댓글을 페이징 처리하여 수집합니다.
     */
    private List<InstagramCommentDto> getAllComments(String postId) {
        List<InstagramCommentDto> allComments = new ArrayList<>();
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://graph.instagram.com/v25.0/" + postId + "/comments?fields=id,username,text,timestamp&access_token=" + ACCESS_TOKEN;

        System.out.println("[GetAllComments] 댓글 수집 시작 - PostId: " + postId);
        int pageCount = 1;
        while (url != null) {
            try {
                System.out.println("[GetAllComments] Page " + pageCount + " 호출 URL: " + url);
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                if (response == null) {
                    System.out.println("[GetAllComments] 응답 객체가 null입니다.");
                    break;
                }
                System.out.println("[GetAllComments] 응답 전체 JSON: " + response);

                List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
                if (data != null) {
                    System.out.println("[GetAllComments] 이번 페이지 댓글 수: " + data.size());
                    for (Map<String, Object> item : data) {
                        String id = item.get("id") != null ? item.get("id").toString() : "";
                        String username = item.get("username") != null ? item.get("username").toString() : "";
                        String text = item.get("text") != null ? item.get("text").toString() : "";
                        String timestamp = item.get("timestamp") != null ? item.get("timestamp").toString() : "";

                        allComments.add(new InstagramCommentDto(id, username, text, timestamp));
                    }
                } else {
                    System.out.println("[GetAllComments] 이번 페이지 data가 null입니다.");
                }

                Map<String, Object> paging = (Map<String, Object>) response.get("paging");
                if (paging != null && paging.containsKey("next")) {
                    url = paging.get("next").toString();
                    pageCount++;
                } else {
                    url = null;
                }
            } catch (Exception e) {
                System.out.println("[GetAllComments] 에러 발생: " + e.getMessage());
                e.printStackTrace();
                break;
            }
        }
        System.out.println("[GetAllComments] 댓글 수집 종료 - 총 댓글 수: " + allComments.size());
        return allComments;
    }

    /**
     * 수집된 댓글 목록을 필터링 조건에 따라 필터링합니다.
     */
    private List<InstagramCommentDto> filterComments(List<InstagramCommentDto> comments, InstagramDrawRequest request) {
        List<InstagramCommentDto> filtered = new ArrayList<>();
        Set<String> seenUsernames = new HashSet<>();

        int keywordFailCount = 0;
        int minTagsFailCount = 0;
        int duplicateFailCount = 0;

        for (InstagramCommentDto comment : comments) {
            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
                if (!comment.getText().contains(request.getKeyword())) {
                    keywordFailCount++;
                    continue;
                }
            }

            if (request.getMinTags() > 0) {
                int tagCount = countTags(comment.getText());
                if (tagCount < request.getMinTags()) {
                    minTagsFailCount++;
                    continue;
                }
            }

            if (request.isExcludeDuplicates()) {
                if (seenUsernames.contains(comment.getUsername())) {
                    duplicateFailCount++;
                    continue;
                }
                seenUsernames.add(comment.getUsername());
            }

            filtered.add(comment);
        }

        System.out.println("[FilterComments] 필터링 결과 - 키워드 필터 탈락: " + keywordFailCount 
            + ", 최소 태그 수 탈락: " + minTagsFailCount 
            + ", 중복 제거 탈락: " + duplicateFailCount);
        return filtered;
    }

    private int countTags(String text) {
        if (text == null || text.isEmpty()) {
            return 0;
        }
        Pattern pattern = Pattern.compile("@[a-zA-Z0-9._]+");
        Matcher matcher = pattern.matcher(text);
        int count = 0;
        while (matcher.find()) {
            count++;
        }
        return count;
    }

    private List<InstagramCommentDto> pickRandomWinners(List<InstagramCommentDto> comments, int winnerCount) {
        if (comments.isEmpty()) {
            return Collections.emptyList();
        }

        List<InstagramCommentDto> shuffled = new ArrayList<>(comments);
        Collections.shuffle(shuffled);

        int limit = Math.min(winnerCount, shuffled.size());
        return shuffled.subList(0, limit);
    }
}