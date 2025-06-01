package com.bizcof.wms.system.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class LoginUserRequest {
    @Schema(description = "로그인 아이디")
    private String loginId;
    @Schema(description = "비밀번호")
    private String password;



}
