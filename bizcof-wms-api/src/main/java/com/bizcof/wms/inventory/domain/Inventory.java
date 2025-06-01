package com.bizcof.wms.inventory.domain;

import com.bizcof.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "t_inventory",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_inventory_unique",
        columnNames = {"item_id", "location_code", "lot_no", "make_date", "expire_date", "make_no"}
    )
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Long id;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "location_code", nullable = false, length = 15)
    private String locationCode;

    @Column(name = "lot_no", length = 50)
    private String lotNo;

    @Column(name = "expire_date", length = 10)
    private String expireDate;

    @Column(name = "make_date", length = 10)
    private String makeDate;

    @Column(name = "make_no", length = 50)
    private String makeNo;

    @Column(name = "total_qty", precision = 18, scale = 4, nullable = false)
    private BigDecimal totalQty;

    @Column(name = "allocated_qty", precision = 18, scale = 4, nullable = false)
    private BigDecimal allocatedQty;

    @Column(name = "hold_qty", precision = 18, scale = 4, nullable = false)
    private BigDecimal holdQty;

    @Column(name = "available_qty", precision = 18, scale = 4, insertable = false, updatable = false)
    private BigDecimal availableQty; // DB generated column

    @Column(name = "inventory_status", length = 20, nullable = false)
    private String inventoryStatus;

    @Column(name = "last_inbound_dt")
    private LocalDateTime lastInboundDt;

    @Column(name = "last_outbound_dt")
    private LocalDateTime lastOutboundDt;

    public void addQuantity(BigDecimal qty) {
        this.totalQty = this.totalQty.add(qty);
    }

    public void subtractQuantity(BigDecimal qty) {
        this.totalQty = this.totalQty.subtract(qty);
    }

    public void allocate(BigDecimal qty) {
        this.allocatedQty = this.allocatedQty.add(qty);
    }

    public void releaseAllocation(BigDecimal qty) {
        this.allocatedQty = this.allocatedQty.subtract(qty);
    }

    public void hold(BigDecimal qty) {
        this.holdQty = this.holdQty.add(qty);
    }

    public void releaseHold(BigDecimal qty) {
        this.holdQty = this.holdQty.subtract(qty);
    }
}