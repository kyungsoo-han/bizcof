package com.bizcof.wms.system.dto;

import com.bizcof.wms.system.domain.User;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Data
public class UserResponse {

    private Long id;
    private String loginId;
    private String name;
    private String password;

    public static UserResponse from(User login) {
        return new UserResponse(login.getId(), login.getLoginId(), login.getName(), login.getPassword());
    }
}
