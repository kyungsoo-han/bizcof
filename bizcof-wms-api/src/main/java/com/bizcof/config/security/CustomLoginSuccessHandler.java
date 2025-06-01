package com.bizcof.config.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;


@Slf4j
@Component
@RequiredArgsConstructor
public class CustomLoginSuccessHandler implements AuthenticationSuccessHandler {
    private final JwtTokenProvider tokenProvider;


     @Override
     public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
             throws IOException {

         String username = authentication.getName();
         // Access Token 및 Refresh Token 생성
         String accessToken = tokenProvider.generateAccessToken(username);
         String refreshToken = tokenProvider.generateRefreshToken(username);
         long refreshTokenExpiry = tokenProvider.getRefreshTokenExpiry(); // Refresh Token 만료 시간

         SecurityContextHolder.getContext().setAuthentication(authentication);
         System.out.println("authentication.getPrincipal() = " + authentication.getPrincipal());

         ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                        .httpOnly(true) // HttpOnly 설정 (JavaScript에서 접근 불가)
                        //.secure(true)   // HTTPS 환경에서만 동작
                        .path("/")      // 쿠키의 유효 경로 설정
                        .maxAge(refreshTokenExpiry / 1000) // Refresh Token 만료 시간(초 단위)
                        .build();

         // Refresh Token 저장 (예: Redis 또는 DB)
         // refreshTokenRepository.save(new RefreshToken(username, refreshToken));

         // Access Token 및 Refresh Token 클라이언트로 전달
         response.setHeader("Set-Cookie", refreshCookie.toString());

         response.sendRedirect("/");
     }


}
