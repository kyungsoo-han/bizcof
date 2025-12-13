package com.bizcof.wms.inbound.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InboundFullResponse {

    @Schema(description = "입고 헤더 정보")
    private InboundHeaderResponse header;

    @Schema(description = "입고 상세 목록")
    private List<InboundDetailResponse> details;
}
