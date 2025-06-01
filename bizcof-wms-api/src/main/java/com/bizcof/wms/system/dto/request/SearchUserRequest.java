package com.bizcof.wms.system.dto.request;

import lombok.Data;

@Data
public class SearchUserRequest {
    private String searchLoginId;
    private String searchUserName;
    private String searchUseYn;
}
