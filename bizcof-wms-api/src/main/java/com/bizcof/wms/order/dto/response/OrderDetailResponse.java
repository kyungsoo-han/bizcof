package com.bizcof.wms.order.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "주문 상세 품목 응답 DTO")
public class OrderDetailResponse {

    @Schema(description = "주문 ID", example = "1")
    private Long orderId;

    @Schema(description = "품목 ID", example = "2001")
    private Long itemId;

    @Schema(description = "품목 코드", example = "CAKE001")
    private String itemCode;

    @Schema(description = "품목 이름", example = "생크림 케이크")
    private String itemName;

    @Schema(description = "주문 당시 품목 이름(히스토리용)", example = "생크림 케이크")
    private String orderItemName;

    @Schema(description = "주문 수량", example = "3.0000")
    private BigDecimal orderQty;

    @Schema(description = "보조 메모", example = "소량 포장 요청")
    private String subMemo;
}