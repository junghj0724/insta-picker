package com.instapicker.backend.config;

import com.instapicker.backend.entity.MemberEntity;
import com.instapicker.backend.entity.Role;
import com.instapicker.backend.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 앱 실행 시 관리자 계정이 없으면 생성
        if (memberRepository.findByUsername("admin").isEmpty()) {
            MemberEntity admin = MemberEntity.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin1234"))
                    .role(Role.ROLE_ADMIN)
                    .build();
            memberRepository.save(admin);
            System.out.println("관리자 계정이 생성되었습니다. (아이디: admin / 비밀번호: admin1234)");
        }
    }
}
