package com.bizcof.wms.order.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(staticName = "of")
@Builder
@Schema(description = "주문 확정 요청 DTO")
public class OrderConfirmRequest {

    @Schema(description = "주문 확정")
    private String orderNo;

}