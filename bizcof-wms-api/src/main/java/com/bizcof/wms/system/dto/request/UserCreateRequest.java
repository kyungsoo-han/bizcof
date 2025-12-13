package com.bizcof.wms.system.dto.request;

import com.bizcof.wms.system.domain.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserCreateRequest {

    private String userId;      // loginId
    private String password;
    private String userName;    // name
    private String email;
    private String tel;
    private String department;
    private String position;
    private String role;
    private String useYn;

    public User toEntity(String encodedPassword) {
        return User.builder()
                .loginId(userId)
                .password(encodedPassword)
                .name(userName)
                .email(email)
                .tel(tel)
                .department(department)
                .position(position)
                .role(role != null ? role : "USER")
                .useYn(useYn != null ? useYn : "Y")
                .build();
    }
}
