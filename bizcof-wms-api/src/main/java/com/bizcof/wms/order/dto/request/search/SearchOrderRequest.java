package com.bizcof.wms.order.dto.request.search;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "주문 검색 조건 요청 DTO")
public class SearchOrderRequest {

    @Schema(description = "검색 - 주문 번호", example = "ORD202405180001")
    private String searchOrderNo;

    @Schema(description = "검색 - 고객 이름", example = "홍길동")
    private String searchCustomerName;

    @Schema(description = "검색 - 주문 시작일", example = "2024-05-01")
    private String orderStartDate;

    @Schema(description = "검색 - 주문 종료일", example = "2024-05-31")
    private String orderEndDate;
}