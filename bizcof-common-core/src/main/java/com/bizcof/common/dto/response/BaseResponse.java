package com.bizcof.common.dto.response;


import com.bizcof.common.constants.ResponseCode;
import lombok.Data;

@Data
public class BaseResponse<T> {

    private final ResponseCode statusCode;

    private final String message;

    private final T data;

    // ✅ 성공 응답
    public static <T> BaseResponse<T> success() {
        return new BaseResponse<>(ResponseCode.SUCCESS, ResponseCode.SUCCESS.getMessage(), null);
    }

    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(ResponseCode.SUCCESS, ResponseCode.SUCCESS.getMessage(), data);
    }

    public static <T> BaseResponse<T> success(String customMessage) {
        return new BaseResponse<>(ResponseCode.SUCCESS, customMessage, null);
    }

    public static <T> BaseResponse<T> success(ResponseCode code, String message, T data) {
        return new BaseResponse<>(code, message, data);
    }

    public static <T> BaseResponse<T> success(ResponseCode code, T data) {
        return new BaseResponse<>(code, code.getMessage(), data);
    }

    // ✅ 실패 응답
    public static <T> BaseResponse<T> fail(ResponseCode code) {
        return new BaseResponse<>(code, code.getMessage(), null);
    }

    public static <T> BaseResponse<T> fail(ResponseCode code, String customMessage) {
        return new BaseResponse<>(code, customMessage, null);
    }

    public static <T> BaseResponse<T> fail(ResponseCode code, String customMessage, T data) {
        return new BaseResponse<>(code, customMessage, data);
    }
}