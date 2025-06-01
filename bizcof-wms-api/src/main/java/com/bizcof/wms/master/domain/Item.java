package com.bizcof.wms.master.domain;

import com.bizcof.common.domain.BaseEntity;
import com.bizcof.wms.master.domain.constant.ItemCategory;
import com.bizcof.wms.master.dto.response.ItemDto;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.Objects;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
@Table(name = "t_item", schema = "various")
@ToString(callSuper = true)
public class Item extends BaseEntity {


    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private String name;
    private String sname;
    private String ename;
    private String type;
    private String spec;
    @Column(name = "customer_id")
    private Long customerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private Customer customer;

    private String inventoryUnitCode;
    private String skuUnitCode;
    private BigDecimal skuPerIuQty;
    private BigDecimal boxPerSkuQty;
    private BigDecimal pltPerSkuQty;

    private Integer price;
    @Column(name = "use_yn")
    private String useYn;
    private String barcode;
    private BigDecimal width;
    private BigDecimal height;
    private BigDecimal depth;
    private BigDecimal weight;
    private String description;
    private String memo;

    @Enumerated(EnumType.STRING)
    private ItemCategory category;
    private Item(
            String code,
            String name,
            String sname,
            String ename,
            String type,
            String spec,
            Long customerId,
            Integer price,
            String inventoryUnitCode,
            String skuUnitCode,
            BigDecimal skuPerIuQty,
            BigDecimal boxPerSkuQty,
            BigDecimal pltPerSkuQty,
            String useYn,
            String barcode,
            BigDecimal width,
            BigDecimal height,
            BigDecimal depth,
            BigDecimal weight,
            String description,
            String memo
    ) {
        this.code = code;
        this.name = name;
        this.sname = sname;
        this.ename = ename;
        this.type = type;
        this.spec = spec;
        this.customerId = customerId;
        this.price = price;
        this.inventoryUnitCode = inventoryUnitCode;
        this.skuUnitCode = skuUnitCode;
        this.skuPerIuQty = skuPerIuQty;
        this.boxPerSkuQty = boxPerSkuQty;
        this.pltPerSkuQty = pltPerSkuQty;
        this.useYn = useYn;
        this.barcode = barcode;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.weight = weight;
        this.description = description;
        this.memo = memo;
    }

    public static Item of(
            String code,
            String name,
            String sname,
            String ename,
            String type,
            String spec,
            Long custId,
            Integer price,
            String inventoryUnitCode,
            String skuUnitCode,
            BigDecimal skuPerIuQty,
            BigDecimal boxPerSkuQty,
            BigDecimal pltPerSkuQty,
            String useYn,
            String barcode,
            BigDecimal width,
            BigDecimal height,
            BigDecimal depth,
            BigDecimal weight,
            String description,
            String memo
    ) {
        return new Item(
                code,
                name,
                sname,
                ename,
                type,
                spec,
                custId,
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


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Item that)) return false;
        return id != null && id.equals(that.getId());
    }
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    public void update(ItemDto dto) {
        this.name = dto.getName();
        this.barcode = dto.getBarcode();
        this.customerId = dto.getCustomerId();
        this.ename = dto.getEname();
        this.sname = dto.getSname();
        this.spec = dto.getSpec();
        this.useYn = dto.getUseYn();
        this.price = dto.getPrice();
        this.inventoryUnitCode = dto.getInventoryUnitCode();
        this.skuUnitCode = dto.getSkuUnitCode();
        this.skuPerIuQty = dto.getSkuPerIuQty();
        this.boxPerSkuQty = dto.getBoxPerSkuQty();
        this.pltPerSkuQty = dto.getPltPerSkuQty();
        this.type = dto.getType();
        this.memo = dto.getMemo();
        this.description = dto.getDescription();
        this.width = dto.getWidth();
        this.depth = dto.getDepth();
        this.weight = dto.getWeight();
        this.height = dto.getHeight();
    }
}
