package com.instapicker.backend.controller;

import com.instapicker.backend.dto.MemberForm;
import com.instapicker.backend.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/join")
    public String join(@RequestBody MemberForm form) {
        memberService.join(form);
        return "회원가입 완료!";
    }

    @PostMapping("/login")
    public String login(@RequestBody MemberForm form) {
        return memberService.login(form); // 토큰 문자열 반환
    }
}