package com.bizcof.wms.order.dto.request;

import com.bizcof.wms.order.domain.Order;
import com.bizcof.wms.order.domain.constant.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(staticName = "of")
@Builder
@Schema(description = "주문 등록 요청 DTO")
public class OrderCreateRequest {

    @Schema(description = "주문 일자")
    private String orderDate;

    @Schema(description = "배송 일자")
    private String deliveryDate;

    @Schema(description = "요청 납기일")
    private String dueDate;

    @Schema(description = "거래처 ID")
    private Long customerId;

    @Schema(description = "고객 이름")
    private String customerName;

    @Schema(description = "배송지 ID")
    private Long deliveryId;

    @Schema(description = "배송지 주소")
    private String deliveryAddress;

    @Schema(description = "연락처")
    private String phoneNbr;

    @Schema(description = "메모")
    private String memo;

    @Schema(description = "고객 요청사항")
    private String customerMemo;

    @Schema(description = "상세 품목 리스트")
    private List<OrderDetailRequest> items;
}