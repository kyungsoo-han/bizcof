package com.bizcof.config;

import com.bizcof.common.constants.ResponseCode;
import com.bizcof.common.dto.response.BaseResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Slf4j

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * ✅ IllegalArgumentException 처리 (ex. 순환 참조)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BaseResponse<?> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("잘못된 요청 [{}] - {}", request.getRequestURI(), ex.getMessage());
        return BaseResponse.fail(ResponseCode.BAD_REQUEST, ex.getMessage());
    }

    /**
     * ✅ 그 외 알 수 없는 예외 처리
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public BaseResponse<?> handleException(Exception ex, HttpServletRequest request) {
        log.error("서버 오류 [{}]", request.getRequestURI(), ex);
        return BaseResponse.fail(ResponseCode.SERVER_ERROR, ex.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
      public BaseResponse<?> handleNoResourceFound(NoResourceFoundException ex, HttpServletRequest request) {
          String uri = request.getRequestURI();
          if (uri != null && uri.startsWith("/.well-known")) {
              // 로그 없이 조용히 NOT_FOUND 응답
              return BaseResponse.fail(ResponseCode.NOT_FOUND, "Not found");
          }

          // 그 외는 일반 로그 처리
          log.warn("정적 리소스 없음 [{}]: {}", uri, ex.getMessage());
          return BaseResponse.fail(ResponseCode.NOT_FOUND, "요청하신 리소스를 찾을 수 없습니다.");
      }
}