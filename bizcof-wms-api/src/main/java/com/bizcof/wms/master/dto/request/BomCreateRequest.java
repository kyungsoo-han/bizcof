package com.bizcof.wms.master.dto.request;

import com.bizcof.wms.master.domain.Bom;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor(staticName = "of")
@Builder
@Schema(description = "BOM 등록 요청 DTO")
public class BomCreateRequest {

    @Schema(description = "상위 품목 ID (완제품)", example = "1001")
    private Long parentItemId;

    @Schema(description = "하위 품목 ID (자재)", example = "2001")
    private Long childItemId;

    @Schema(description = "소요 수량", example = "3.0000")
    private BigDecimal requiredQty;

    @Schema(description = "단위", example = "g")
    private String unit;

    @Schema(description = "표시 순서", example = "1")
    private Integer sortOrder;

    @Schema(description = "비고", example = "딸기 장식 포함")
    private String memo;

    public Bom toEntity() {
        return Bom.builder()
                .parentItemId(parentItemId)
                .childItemId(childItemId)
                .requiredQty(requiredQty)
                .sortOrder(sortOrder)
                .memo(memo)
                .build();
    }
}