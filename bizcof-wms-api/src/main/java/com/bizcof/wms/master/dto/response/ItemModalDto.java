package com.bizcof.wms.master.dto.response;

import com.querydsl.core.annotations.QueryProjection;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 코드 + 명칭 간단 조회 DTO
 */
@Data
@NoArgsConstructor
public class ItemModalDto {
    private Long id;
    private String code;
    private String name;
    private String spec;
    private String inventoryUnitCode;
    private String skuUnitCode;
    private BigDecimal skuPerIuQty;
    private BigDecimal boxPerSkuQty;
    private BigDecimal pltPerSkuQty;

    @QueryProjection
    public ItemModalDto(Long id, String code, String name, String spec, String inventoryUnitCode, String skuUnitCode, BigDecimal skuPerIuQty, BigDecimal boxPerSkuQty, BigDecimal pltPerSkuQty) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.spec = spec;
        this.inventoryUnitCode = inventoryUnitCode;
        this.skuUnitCode = skuUnitCode;
        this.skuPerIuQty = skuPerIuQty;
        this.boxPerSkuQty = boxPerSkuQty;
        this.pltPerSkuQty = pltPerSkuQty;
    }
}
