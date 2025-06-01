package com.bizcof.wms.order.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "주문 공통 정보 응답 DTO")
public class OrderHeaderResponse {

    @Schema(description = "주문 번호", example = "ORD202405180001")
    private String orderNo;

    @Schema(description = "주문 일자", example = "2024-05-18")
    private String orderDate;

    @Schema(description = "거래처 ID", example = "1001")
    private Long customerId;

    @Schema(description = "고객 이름", example = "홍길동")
    private String customerName;

    @Schema(description = "수기 입력 고객 이름", example = "홍길동2(수기입력)")
    private String customerName2;

    @Schema(description = "배송지 주소", example = "수원시 장안구...")
    private String deliveryAddress;

    @Schema(description = "연락처", example = "010-1234-5678")
    private String phoneNbr;

    @Schema(description = "배송 일자", example = "2024-05-19")
    private String deliveryDate;

    @Schema(description = "요청 납기일", example = "2024-05-20")
    private String dueDate;

    @Schema(description = "기타 메모", example = "VIP 고객")
    private String memo;

    @Schema(description = "고객 요청사항", example = "딸기 잼은 빼주세요")
    private String customerMemo;

    @Schema(description = "주문 상태", example = "DELIVERED")
    private String orderStatus;
}