package com.bizcof.wms.outbound.dto.request.search;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Schema(description = "출고 조회 Request")
@AllArgsConstructor(staticName = "of")
public class SearchOutboundRequest {
    @Schema(description = "출고 번호", example = "OUT202505110001")
    private String outboundNo;

    @Schema(description = "거래처 코드", example = "2001")
    private String customerCode;

    @Schema(description = "거래처 명", example = "거래처명")
    private String customerName;

    @Schema(description = "시작일", example = "2025-05-12")
    private String startDate;

    @Schema(description = "종료일", example = "2025-05-12")
    private String endDate;



}