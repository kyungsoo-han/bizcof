package com.bizcof.wms.outbound.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "출고 수정 요청 DTO")
public class OutboundUpdateRequest {
    @Schema(description = "출고 번호", example = "IN202405080001")
     private String outboundNo;

     @Schema(description = "출고 일자", example = "2024-05-08")
     private String outboundDate;

     @Schema(description = "고객사 ID", example = "2001")
     private Long customerId;

     @Schema(description = "출고 타입", example = "NORMAL")
     private String outboundType;

     @Schema(description = "메모", example = "수정 요청 사항 반영")
     private String memo;

     @Schema(description = "출고 상세 품목 리스트")
     private List<OutboundDetailRequest> items;
}