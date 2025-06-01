package com.bizcof.wms.inbound.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InboundDetailResponse {

    @Schema(description = "순번", example = "1")
    private Integer seqNo;

    @Schema(description = "품목 ID", example = "1")
    private Long itemId;

    @Schema(description = "품목 코드", example = "1001")
    private String itemCode;

    @Schema(description = "품목 명", example = "칫솔")
    private String itemName;

    @Schema(description = "박스당 수량", example = "2.0000")
    private BigDecimal boxPerSkuQty;

    @Schema(description = "박스 수량", example = "5.0000")
    private BigDecimal boxQty;

    @Schema(description = "팔레트당 수량", example = "2.0000")
    private BigDecimal pltPerSkuQty;

    @Schema(description = "팔레트 수량", example = "4.0000")
    private BigDecimal pltQty;

    @Schema(description = "입고 수량", example = "100.0000")
    private BigDecimal inboundQty;

    @Schema(description = "로케이션 코드", example = "A01-01-01")
    private String locationCode;

    @Schema(description = "유효 기한", example = "2025-12-31")
    private String expireDate;

    @Schema(description = "제조 일자", example = "2024-12-01")
    private String makeDate;

    @Schema(description = "제조 번호", example = "MFG12345")
    private String makeNo;

    @Schema(description = "LOT 번호", example = "LOT202405")
    private String lotNo;

    @Schema(description = "메모", example = "")
    private String memo;

}
