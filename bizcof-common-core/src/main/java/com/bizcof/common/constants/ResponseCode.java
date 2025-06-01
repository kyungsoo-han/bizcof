package com.bizcof.common.constants;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ResponseCode {
    // API CODE
    SUCCESS(HttpStatus.OK, 200, "API-SUCCESS-200","요청하신 사항이 정상적으로 처리됐습니다."),
    NO_CONTENTS(HttpStatus.NO_CONTENT, 204, "API-SUCCESS-204", "요청하신 사항이 정상적으로 처리됐으나, 데이터가 존재하지 않습니다."),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, 400, "CLIENT-ERR-400", "전송한 요청이 잘못된 문법이거나 필수 데이터가 누락되어 있습니다. 관리자에게 문의바랍니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, 401, "CLIENT-ERR-401", "보안 정책으로 인해 로그인 접속이 만료 되었습니다."),
    NOT_FOUND(HttpStatus.NOT_FOUND, 404, "CLIENT-ERR-404", "조회하신 화면이 존재하지 않습니다. 홈 화면으로 이동합니다."),
    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 500, "SERVER-ERR-500", "서버에서 에러가 발생하였습니다. 관리자에게 문의바랍니다."),
    // DB CODE
    DB_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 600, "DB-ERR-600", "데이터베이스 작업 중 에러가 발생하였습니다. 관리자에게 문의바랍니다."),
    SAVE_NOTHING(HttpStatus.INTERNAL_SERVER_ERROR, 601, "DB-WARN-601", "0건이 저장되었습니다. 관리자에게 문의바랍니다."),
    DUPLICATED_DATA(HttpStatus.BAD_REQUEST, 602, "DB-ERR-602", "이미 존재하는 데이터 입니다. 저장하려는 데이터를 다시 한 번 확인해주세요."),
    // BATCH CODE
    BATCH_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, 800, "BATCH-ERR-800", "요청하신 Batch 프로세스 작업 중 에러가 발생하였습니다.");

    private final HttpStatus httpStatus;
    private final int status;
    private final String code;
    private final String message;

    ResponseCode(HttpStatus httpStatus, int status, String code, String message) {
        this.httpStatus = httpStatus;
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
