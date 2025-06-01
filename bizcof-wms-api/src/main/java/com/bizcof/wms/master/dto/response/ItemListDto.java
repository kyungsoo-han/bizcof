package com.bizcof.wms.master.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 목록 조회 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemListDto {
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
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdDt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime modifiedDt;

}