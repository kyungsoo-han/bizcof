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
    private String searchInboundNo;

    @Schema(description = "거래처 코드", example = "2001")
    private String searchCustomerCode;

    @Schema(description = "거래처 명", example = "2001")
    private String searchCustomerName;

    @Schema(description = "입고 일자 From", example = "2025-05-12")
    private String inboundStartDate;

    @Schema(description = "입고 일자 to", example = "2025-05-12")
    private String inboundEndDate;



}