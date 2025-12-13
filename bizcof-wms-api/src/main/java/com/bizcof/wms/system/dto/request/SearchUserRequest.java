package com.bizcof.wms.system.dto.request;

import lombok.Data;

@Data
public class SearchUserRequest {
    private String userId;      // loginId
    private String userName;    // name
    private String department;
    private String useYn;
}
