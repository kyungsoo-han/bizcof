package com.bizcof.config;

import com.bizcof.wms.system.domain.User;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * JPA Auditing을 위한 AuditorAware 구현체
 * 현재 로그인한 사용자의 ID(Long)를 반환
 */
@Component
public class AuditorAwareImpl implements AuditorAware<Long> {

    @Override
    public Optional<Long> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();

        // User 엔티티인 경우 ID 반환
        if (principal instanceof User) {
            return Optional.ofNullable(((User) principal).getId());
        }

        // 익명 사용자 또는 기타 경우
        return Optional.empty();
    }
}
