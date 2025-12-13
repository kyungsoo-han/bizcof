package com.bizcof.config.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RedissonClient redissonClient;
    private final JwtTokenProvider jwtTokenProvider;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";

    /**
     * Refresh Token 저장
     */
    public void saveRefreshToken(String username, String refreshToken) {
        String key = REFRESH_TOKEN_PREFIX + username;
        RBucket<String> bucket = redissonClient.getBucket(key);

        long expirationMs = jwtTokenProvider.getRefreshTokenExpiration();
        bucket.set(refreshToken, expirationMs, TimeUnit.MILLISECONDS);

        log.debug("Refresh token saved for user: {}", username);
    }

    /**
     * Refresh Token 조회
     */
    public String getRefreshToken(String username) {
        String key = REFRESH_TOKEN_PREFIX + username;
        RBucket<String> bucket = redissonClient.getBucket(key);
        return bucket.get();
    }

    /**
     * Refresh Token 검증
     */
    public boolean validateRefreshToken(String username, String refreshToken) {
        String savedToken = getRefreshToken(username);
        return savedToken != null && savedToken.equals(refreshToken);
    }

    /**
     * Refresh Token 삭제 (로그아웃)
     */
    public void deleteRefreshToken(String username) {
        String key = REFRESH_TOKEN_PREFIX + username;
        RBucket<String> bucket = redissonClient.getBucket(key);
        bucket.delete();

        log.debug("Refresh token deleted for user: {}", username);
    }
}
