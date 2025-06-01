package com.bizcof.wms.master.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BomDetailRequest {
    private String rowState; // created, updated, deleted
    private Long bomId;      // null if new
    private Long parentBomId;
    private Long parentItemId;
    private Long childItemId;
    private BigDecimal requiredQty;
    private Integer sortOrder;
    private String memo;
}