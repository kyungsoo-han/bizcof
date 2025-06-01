package com.bizcof.wms.master.dto.response;


import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "BOM 응답 DTO")
public class BomResponse {

    @Schema(description = "BOM ID", example = "1")
    private Long bomId;

    @Schema(description = "상위 품목 ID", example = "1001")
    private Long parentItemId;

    @Schema(description = "하위 품목 ID", example = "2001")
    private Long childItemId;

    @Schema(description = "소요 수량", example = "3.0000")
    private BigDecimal requiredQty;

    @Schema(description = "정렬 순서", example = "1")
    private Integer sortOrder;

    @Schema(description = "비고", example = "딸기 포함")
    private String memo;
}