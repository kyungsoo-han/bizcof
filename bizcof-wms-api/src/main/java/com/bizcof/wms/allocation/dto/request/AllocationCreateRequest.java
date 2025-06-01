package com.bizcof.wms.allocation.dto.request;

import com.bizcof.wms.allocation.domain.constant.AllocationType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
public class AllocationCreateRequest {

    @Schema(description = "할당일자 (yyyy-MM-dd)", example = "2025-05-17")
    private String allocationDate;

    @Schema(description = "할당 유형 (OUTBOUND: 출고, PACKAGING: 포장 등)", example = "OUTBOUND")
    private AllocationType allocationType;

    @Schema(description = "할당 메모", example = "테스트 메모")
    private String memo;

    @Schema(description = "할당 상세 항목 목록")
    private List<AllocationDetailRequest> items;
}