package com.bizcof.wms.outbound.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class OutboundHeaderResponse {

    @Schema(description = "출고 번호", example = "OUT202405080001")
     private String outboundNo;

    @Schema(description = "출고 일자", example = "2024-05-08")
    private String outboundDate;

    @Schema(description = "거래처 ID", example = "1")
    private Long customerId;

    @Schema(description = "거래처 코드", example = "0001")
    private String customerCode;

    @Schema(description = "거래처 명", example = "미라클 인베스트먼트")
    private String customerName;

    @Schema(description = "출고 타입(코드)", example = "NORMAL")
    private String outboundType;

    @Schema(description = "출고 타입", example = "일반 출고")
    private String outboundTypeName;

    @Schema(description = "메모", example = "긴급 출고 요청")
    private String memo;


}
