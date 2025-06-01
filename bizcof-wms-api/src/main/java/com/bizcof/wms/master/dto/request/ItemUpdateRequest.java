package com.bizcof.wms.master.dto.request;


import com.bizcof.common.dto.request.BaseRequest;
import com.bizcof.wms.master.dto.response.ItemDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 수정 요청 DTO
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper=false)
@AllArgsConstructor
public class ItemUpdateRequest extends BaseRequest {
    private Long id;
    private String code;
    private String name;
    private String sname;
    private String ename;
    private String type;
    private String spec;
    private String inventoryUnitCode;
    private String skuUnitCode;
    private BigDecimal skuPerIuQty;
    private BigDecimal boxPerSkuQty;
    private BigDecimal pltPerSkuQty;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private Integer price;
    private String useYn;
    private String barcode;
    private BigDecimal width;
    private BigDecimal height;
    private BigDecimal depth;
    private BigDecimal weight;
    private String description;
    private String memo;

    public ItemDto toDto() {
        return new ItemDto(
                id, code, name, sname, ename, type, spec,
                inventoryUnitCode,
                skuUnitCode,
                skuPerIuQty,
                boxPerSkuQty,
                pltPerSkuQty,
                customerId, price, useYn, barcode,
                width, height, depth, weight, description, memo
        );
    }
}
