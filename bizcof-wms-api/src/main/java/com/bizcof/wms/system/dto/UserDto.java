package com.bizcof.wms.system.dto;

import com.bizcof.wms.system.domain.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {

    private Long userId;
    private String loginId;
    private String name;
    private String memo;
    private String useYn;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdDt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime modifiedDt;

    @QueryProjection
    public UserDto(Long userId, String loginId, String name, String memo, String useYn, LocalDateTime createdDt, LocalDateTime modifiedDt) {
        this.userId = userId;
        this.loginId = loginId;
        this.name = name;
        this.memo = memo;
        this.useYn = useYn;
        this.createdDt = createdDt;
        this.modifiedDt = modifiedDt;
    }


    public User toEntity() {
        return User.of( name, loginId, memo, useYn);
    }

}
