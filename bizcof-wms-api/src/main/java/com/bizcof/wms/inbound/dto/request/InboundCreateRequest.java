package com.bizcof.wms.inbound.dto.request;

import com.bizcof.wms.inbound.domain.InboundHeader;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "입고 등록 요청 DTO")
@AllArgsConstructor(staticName = "of")
public class InboundCreateRequest {
    @Schema(description = "입고 일자", example = "2024-05-08")
    private String inboundDate;

    @Schema(description = "고객사 ID", example = "2001")
    private Long customerId;

    @Schema(description = "입고 타입", example = "NORMAL")
    private String inboundType;

    @Schema(description = "메모", example = "긴급 입고 요청")
    private String memo;

    @Schema(description = "입고 상세 품목 리스트")
    private List<InboundDetailRequest> items;

    public InboundHeader toEntity(String inboundNo) {
        return InboundHeader.builder()
                .inboundNo(inboundNo)
                .inboundDate(inboundDate)
                .customerId(customerId)
                .inboundType(inboundType)
                .memo(memo)
                .build();
    }
}