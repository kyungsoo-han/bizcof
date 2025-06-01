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
    @Schema(description = "출고 번호", example = "INB202505110001")
    private String searchOutboundNo;

    @Schema(description = "거래처 코드", example = "2001")
    private String searchCustomerCode;

    @Schema(description = "거래처 명", example = "2001")
    private String searchCustomerName;

    @Schema(description = "출고 일자 From", example = "2025-05-12")
    private String outboundStartDate;

    @Schema(description = "출고 일자 to", example = "2025-05-12")
    private String outboundEndDate;



}