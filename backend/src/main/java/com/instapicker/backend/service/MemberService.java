package com.instapicker.backend.service;

import com.instapicker.backend.config.JwtUtil;
import com.instapicker.backend.dto.MemberForm;
import com.instapicker.backend.entity.MemberEntity;
import com.instapicker.backend.entity.Role;
import com.instapicker.backend.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public void join(MemberForm form) {
        if (memberRepository.findByUsername(form.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        MemberEntity member = MemberEntity.builder()
                .username(form.getUsername())
                .password(passwordEncoder.encode(form.getPassword())) // 비밀번호 암호화
                .role(Role.ROLE_USER)
                .build();
        memberRepository.save(member);
    }

    public String login(MemberForm form) {
        MemberEntity member = memberRepository.findByUsername(form.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 아이디입니다."));

        if (!passwordEncoder.matches(form.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 틀렸습니다.");
        }

        return jwtUtil.createToken(member.getUsername(), member.getRole().name()); // 토큰 발급
    }
}