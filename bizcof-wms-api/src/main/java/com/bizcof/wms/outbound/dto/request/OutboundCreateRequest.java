package com.bizcof.wms.outbound.dto.request;

import com.bizcof.wms.outbound.domain.OutboundHeader;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "출고 등록 요청 DTO")
@AllArgsConstructor(staticName = "of")
public class OutboundCreateRequest {
    @Schema(description = "출고 일자", example = "2024-05-08")
    private String outboundDate;

    @Schema(description = "고객사 ID", example = "2001")
    private Long customerId;

    @Schema(description = "출고 타입", example = "NORMAL")
    private String outboundType;

    @Schema(description = "메모", example = "긴급 출고 요청")
    private String memo;

    @Schema(description = "출고 상세 품목 리스트")
    private List<OutboundDetailRequest> items;

    public OutboundHeader toEntity(String outboundNo) {
        return OutboundHeader.builder()
                .outboundNo(outboundNo)
                .outboundDate(outboundDate)
                .customerId(customerId)
                .outboundType(outboundType)
                .memo(memo)
                .build();
    }
}