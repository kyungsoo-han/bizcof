package com.bizcof.config.security;

import com.bizcof.common.constants.ResponseCode;
import com.bizcof.common.dto.response.BaseResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    /**
     * 로그인 - Access Token + Refresh Token 발급
     */
    @PostMapping("/login")
    public ResponseEntity<BaseResponse<?>> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {

        try {
            log.info("=== 로그인 시도: loginId={}", request.loginId());

            // 인증
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.loginId(), request.password())
            );

            log.info("=== 인증 성공: {}", authentication.getName());

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername();

            // Access Token 생성
            String accessToken = jwtTokenProvider.generateAccessToken(username);

            // Refresh Token 생성 및 Redis 저장
            String refreshToken = jwtTokenProvider.generateRefreshToken(username);
            refreshTokenService.saveRefreshToken(username, refreshToken);

            // Refresh Token을 HttpOnly Cookie로 설정
            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(true)  // HTTPS에서만 전송
                    .path("/api/auth")
                    .maxAge(jwtTokenProvider.getRefreshTokenExpiration() / 1000)
                    .sameSite("Strict")
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            log.info("User logged in: {}", username);

            return ResponseEntity.ok(BaseResponse.success(Map.of(
                    "accessToken", accessToken,
                    "username", username
            )));

        } catch (AuthenticationException e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(401)
                    .body(BaseResponse.fail(ResponseCode.UNAUTHORIZED, "아이디 또는 비밀번호가 올바르지 않습니다."));
        }
    }

    /**
     * Access Token 갱신
     */
    @PostMapping("/refresh")
    public ResponseEntity<BaseResponse<?>> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken) {

        if (refreshToken == null) {
            return ResponseEntity.status(401)
                    .body(BaseResponse.fail(ResponseCode.UNAUTHORIZED, "Refresh token이 없습니다."));
        }

        // Refresh Token 유효성 검증
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(401)
                    .body(BaseResponse.fail(ResponseCode.UNAUTHORIZED, "유효하지 않은 refresh token입니다."));
        }

        String username = jwtTokenProvider.getUsername(refreshToken);

        // Redis에 저장된 토큰과 비교
        if (!refreshTokenService.validateRefreshToken(username, refreshToken)) {
            return ResponseEntity.status(401)
                    .body(BaseResponse.fail(ResponseCode.UNAUTHORIZED, "Refresh token이 만료되었거나 유효하지 않습니다."));
        }

        // 새 Access Token 발급
        String newAccessToken = jwtTokenProvider.generateAccessToken(username);

        log.debug("Access token refreshed for user: {}", username);

        return ResponseEntity.ok(BaseResponse.success(Map.of(
                "accessToken", newAccessToken
        )));
    }

    /**
     * 로그아웃 - Refresh Token 삭제
     */
    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<?>> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
            String username = jwtTokenProvider.getUsername(refreshToken);
            refreshTokenService.deleteRefreshToken(username);
            log.info("User logged out: {}", username);
        }

        // Cookie 삭제
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/api/auth")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(BaseResponse.success("로그아웃되었습니다."));
    }

    /**
     * 현재 사용자 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<BaseResponse<?>> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401)
                    .body(BaseResponse.fail(ResponseCode.UNAUTHORIZED, "인증되지 않은 사용자입니다."));
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        return ResponseEntity.ok(BaseResponse.success(Map.of(
                "username", userDetails.getUsername(),
                "authorities", userDetails.getAuthorities()
        )));
    }

    // 로그인 요청 DTO
    public record LoginRequest(String loginId, String password) {}
}
