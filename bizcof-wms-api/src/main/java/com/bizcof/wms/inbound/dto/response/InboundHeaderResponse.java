package com.bizcof.wms.inbound.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class InboundHeaderResponse {

    @Schema(description = "입고 번호", example = "IN202405080001")
     private String inboundNo;

    @Schema(description = "입고 일자", example = "2024-05-08")
    private String inboundDate;

    @Schema(description = "거래처 ID", example = "1")
    private Long customerId;

    @Schema(description = "거래처 코드", example = "0001")
    private String customerCode;

    @Schema(description = "거래처 명", example = "미라클 인베스트먼트")
    private String customerName;

    @Schema(description = "입고 타입(코드)", example = "NORMAL")
    private String inboundType;

    @Schema(description = "입고 타입", example = "일반 입고")
    private String inboundTypeName;

    @Schema(description = "메모", example = "긴급 입고 요청")
    private String memo;


}
