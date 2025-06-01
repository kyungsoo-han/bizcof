package com.bizcof.wms.inbound.dto.request;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "입고 수정 요청 DTO")
public class InboundUpdateRequest {
    @Schema(description = "입고 번호", example = "IN202405080001")
     private String inboundNo;

     @Schema(description = "입고 일자", example = "2024-05-08")
     private String inboundDate;

     @Schema(description = "고객사 ID", example = "2001")
     private Long customerId;

     @Schema(description = "입고 타입", example = "NORMAL")
     private String inboundType;

     @Schema(description = "메모", example = "수정 요청 사항 반영")
     private String memo;

     @Schema(description = "입고 상세 품목 리스트")
     private List<InboundDetailRequest> items;
}