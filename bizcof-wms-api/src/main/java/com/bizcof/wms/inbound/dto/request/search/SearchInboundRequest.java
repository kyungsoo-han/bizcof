package com.bizcof.wms.inbound.dto.request.search;

import com.bizcof.wms.inbound.domain.InboundHeader;
import com.bizcof.wms.inbound.dto.request.InboundDetailRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@Schema(description = "입고 조회 Request")
@AllArgsConstructor(staticName = "of")
public class SearchInboundRequest {
    @Schema(description = "입고 번호", example = "INB202505110001")
    private String inboundNo;

    @Schema(description = "거래처 코드", example = "2001")
    private String customerCode;

    @Schema(description = "거래처 명", example = "거래처명")
    private String customerName;

    @Schema(description = "시작일", example = "2025-05-12")
    private String startDate;

    @Schema(description = "종료일", example = "2025-05-12")
    private String endDate;



}