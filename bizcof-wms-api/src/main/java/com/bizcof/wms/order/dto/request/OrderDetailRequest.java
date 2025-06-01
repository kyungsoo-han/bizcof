package com.bizcof.wms.order.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderDetailRequest {

    @Schema(description = "품목 ID")
    private Long itemId;

    @Schema(description = "품목명")
    private String itemName;

    @Schema(description = "수량")
    private BigDecimal orderQty;

    @Schema(description = "품목별 메모")
    private String subMemo;

    @Schema(description = "삭제여부", example = "Y/N")
    private String isDeleted;

}
