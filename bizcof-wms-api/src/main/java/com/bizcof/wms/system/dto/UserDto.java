package com.bizcof.wms.system.dto;

import com.bizcof.wms.system.domain.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UserDto {

    private Long id;
    private String userId;      // loginId
    private String userName;    // name
    private String email;
    private String tel;
    private String department;
    private String position;
    private String role;
    private String useYn;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdDt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime modifiedDt;

    @QueryProjection
    public UserDto(Long id, String userId, String userName, String email, String tel,
                   String department, String position, String role, String useYn,
                   LocalDateTime createdDt, LocalDateTime modifiedDt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.tel = tel;
        this.department = department;
        this.position = position;
        this.role = role;
        this.useYn = useYn;
        this.createdDt = createdDt;
        this.modifiedDt = modifiedDt;
    }

    public static UserDto from(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUserId(user.getLoginId());
        dto.setUserName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setTel(user.getTel());
        dto.setDepartment(user.getDepartment());
        dto.setPosition(user.getPosition());
        dto.setRole(user.getRole());
        dto.setUseYn(user.getUseYn());
        dto.setCreatedDt(user.getCreatedDt());
        dto.setModifiedDt(user.getModifiedDt());
        return dto;
    }
}
