package com.bizcof.config.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthFailureHandler implements AuthenticationFailureHandler {
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, org.springframework.security.core.AuthenticationException exception) throws IOException, ServletException {
        // 로그인 실패 이유에 따라 다른 에러 메시지 전달
          String errorMessage = "아이디 또는 비밀번호가 잘못되었습니다.";
          if (exception.getMessage().contains("User is disabled")) {
              errorMessage = "계정이 비활성화되었습니다.";
          } else if (exception.getMessage().contains("User account has expired")) {
              errorMessage = "계정이 만료되었습니다.";
          }

          // 로그인 페이지로 에러 메시지 전달
          response.sendRedirect("/user/loginForm?error=" + errorMessage);
    }
}
