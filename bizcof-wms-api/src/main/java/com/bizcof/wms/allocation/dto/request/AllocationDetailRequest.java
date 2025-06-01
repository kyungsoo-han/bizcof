package com.bizcof.wms.allocation.dto.request;

import com.bizcof.wms.allocation.domain.AllocationDetail;
import com.bizcof.wms.allocation.domain.constant.AllocationType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

    @Data
    public class AllocationDetailRequest {

        @Schema(description = "품목 ID", example = "2")
        private Long itemId;

        @Schema(description = "할당 수량", example = "5.0")
        private BigDecimal allocatedQty;

        @Schema(description = "로케이션 코드", example = "12-33-21-41")
        private String locationCode;

        @Schema(description = "LOT 번호", example = "INB2025051400004-0001")
        private String lotNo;

        @Schema(description = "제조일자 (yyyy-MM-dd)", example = "2025-05-02")
        private String makeDate;

        @Schema(description = "유효기한 (yyyy-MM-dd)", example = "2025-05-28")
        private String expireDate;

        @Schema(description = "제조번호", example = "aaa")
        private String makeNo;

        @Schema(description = "참조 유형 (예: OUTBOUND, PACKAGING 등)", example = "OUTBOUND")
        private String refType;

        @Schema(description = "참조 ID (예: 출고번호, 포장번호 등)", example = "1001")
        private Long refId;



    public AllocationDetail toEntity(String allocationNo, int seqNo) {
        return AllocationDetail.builder()
                .allocationNo(allocationNo)
                .seqNo(seqNo)
                .itemId(itemId)
                .allocatedQty(allocatedQty)
                .locationCode(locationCode)
                .lotNo(lotNo)
                .makeDate(makeDate)
                .expireDate(expireDate)
                .makeNo(makeNo)
                .refType(AllocationType.OUTBOUND.name()) // or PACKING
                .refId(refId)
                .build();
    }
}
