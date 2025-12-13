package com.bizcof.wms.system.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserUpdateRequest {

    private Long id;
    private String userName;    // name
    private String email;
    private String tel;
    private String department;
    private String position;
    private String role;
    private String useYn;
}
