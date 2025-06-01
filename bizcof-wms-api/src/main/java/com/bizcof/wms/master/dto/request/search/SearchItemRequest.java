package com.bizcof.wms.master.dto.request.search;

import lombok.Data;

@Data
public class SearchItemRequest {
    private String searchItemCode;       // 품목 코드
    private String searchItemName;       // 품목 명
    private String searchItemType;       // 품목 타입 (제품, 반제품, 자재)
    private String searchUseYn;      // 사용 여부 (Y/N)
    private String searchCustomerCode;   // 거래처 코드
    private String searchCustomerName;   // 거래처 명
    private String searchBacode;    // 바코드
}
