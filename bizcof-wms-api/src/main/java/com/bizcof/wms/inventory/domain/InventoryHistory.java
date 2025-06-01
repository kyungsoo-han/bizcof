package com.bizcof.wms.inventory.domain;


import com.bizcof.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "t_inventory_history")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "location_code", nullable = false, length = 15)
    private String locationCode;

    @Column(name = "lot_no", length = 50)
    private String lotNo;

    @Column(name = "make_date", length = 10)
    private String makeDate;

    @Column(name = "expire_date", length = 10)
    private String expireDate;

    @Column(name = "make_no", length = 50)
    private String makeNo;

    @Column(name = "change_qty", precision = 18, scale = 4, nullable = false)
    private BigDecimal changeQty;

    @Column(name = "before_qty", precision = 18, scale = 4)
    private BigDecimal beforeQty;

    @Column(name = "after_qty", precision = 18, scale = 4)
    private BigDecimal afterQty;

    @Column(name = "history_type", length = 20, nullable = false)
    private String historyType;

    @Column(name = "history_reason", length = 100)
    private String historyReason;

    @Column(name = "ref_type", length = 20)
    private String refType;

    @Column(name = "ref_no", length = 30)
    private String refNo;

    @Column(name = "ref_seq")
    private Integer refSeq;

    @Column(name = "inventory_status", length = 20)
    private String inventoryStatus;
}