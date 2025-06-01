package com.bizcof.wms.order.dto.request;

import com.bizcof.wms.order.domain.constant.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "주문 수정 요청 DTO")
public class OrderUpdateRequest {

    @Schema(description = "주문 번호", example = "ORD202405180001")
    private String orderNo;

    @Schema(description = "주문 일자", example = "2024-05-18")
    private String orderDate;

    @Schema(description = "배송 일자", example = "2024-05-19")
    private String deliveryDate;

    @Schema(description = "요청 납기일", example = "2024-05-20")
    private String dueDate;

    @Schema(description = "거래처 ID", example = "1001")
    private Long customerId;

    @Schema(description = "고객 이름", example = "홍길동")
    private String customerName;

    @Schema(description = "배송지 ID", example = "3001")
    private Long deliveryId;

    @Schema(description = "배송지 주소", example = "서울시 강남구 테헤란로 123")
    private String deliveryAddress;

    @Schema(description = "연락처", example = "010-1234-5678")
    private String phoneNbr;

    @Schema(description = "기타 메모")
    private String memo;

    @Schema(description = "고객 요청사항")
    private String customerMemo;

    @Schema(description = "상세 품목 리스트")
    private List<OrderDetailRequest> items;
}