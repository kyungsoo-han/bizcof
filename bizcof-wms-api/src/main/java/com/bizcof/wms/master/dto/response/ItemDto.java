package com.bizcof.wms.master.dto.response;

import com.bizcof.wms.master.domain.Item;
import com.querydsl.core.annotations.QueryProjection;
import lombok.*;

import java.math.BigDecimal;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private Long id;
    private String code;
    private String name;
    private String sname;
    private String ename;
    private String type;
    private String inventoryUnitCode;
    private String skuUnitCode;
    private BigDecimal skuPerIuQty;
    private BigDecimal boxPerSkuQty;
    private BigDecimal pltPerSkuQty;
    private String spec;
    private Long customerId;
    private Integer price;
    private String useYn;
    private String barcode;
    private BigDecimal width;
    private BigDecimal height;
    private BigDecimal depth;
    private BigDecimal weight;
    private String description;
    private String memo;

    @QueryProjection
    public ItemDto(Long id, String code, String name, String sname, String ename, String type,
                   String spec,
                   String inventoryUnitCode,
                   String skuUnitCode,
                   BigDecimal skuPerIuQty,
                   BigDecimal boxPerSkuQty,
                   BigDecimal pltPerSkuQty, Long customerId, Integer price, String useYn,
                   String barcode, BigDecimal width, BigDecimal height, BigDecimal depth,
                   BigDecimal weight, String description, String memo) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.sname = sname;
        this.ename = ename;
        this.type = type;
        this.spec = spec;
        this.inventoryUnitCode = inventoryUnitCode;
        this.skuUnitCode = skuUnitCode;
        this.skuPerIuQty = skuPerIuQty;
        this.boxPerSkuQty = boxPerSkuQty;
        this.pltPerSkuQty = pltPerSkuQty;
        this.customerId = customerId;
        this.price = price;
        this.useYn = useYn;
        this.barcode = barcode;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.weight = weight;
        this.description = description;
        this.memo = memo;
    }

    public Item toEntity() {
        return Item.of(
                code,
                name,
                sname,
                ename,
                type,
                spec,
                customerId,
                price,
                inventoryUnitCode,
                skuUnitCode,
                skuPerIuQty,
                boxPerSkuQty,
                pltPerSkuQty,
                useYn,
                barcode,
                width,
                height,
                depth,
                weight,
                description,
                memo
        );
    }
}