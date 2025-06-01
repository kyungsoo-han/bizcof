package com.bizcof.wms.master.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "BOM 트리 응답 객체")
public class BomTreeResponse {

    @Schema(description = "트리 ID (계층 표현용)", example = "0101")
    private String treeId;

    @Schema(description = "상위 트리 ID", example = "01")
    private String parentTreeId;

    @Schema(description = "BOM ID", example = "1001")
    private Long bomId;

    @Schema(description = "상위 BOM ID", example = "1000")
    private Long parentBomId;

    @Schema(description = "자식 품목 ID", example = "2001")
    private Long childItemId;

    @Schema(description = "부모 품목 ID", example = "1001")
    private Long parentItemId;

    @Schema(description = "품목 코드", example = "ITM0001")
    private String itemCode;

    @Schema(description = "품목명", example = "상품A")
    private String itemName;

    @Schema(description = "규격", example = "500ml")
    private String spec;

    @Schema(description = "소요량", example = "2.5")
    private BigDecimal requiredQty;

    @Schema(description = "단위", example = "EA")
    private String unit;

    @Schema(description = "정렬 순서", example = "1")
    private Integer sortOrder;

    @Schema(description = "편집 가능 여부", example = "true", requiredMode = Schema.RequiredMode.REQUIRED)
    @JsonProperty("isEditable")
    private boolean editable;


    private Boolean hasChild; // ✅ 추가
}