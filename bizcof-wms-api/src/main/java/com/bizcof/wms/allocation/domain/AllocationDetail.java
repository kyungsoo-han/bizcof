package com.bizcof.wms.allocation.domain;

import com.bizcof.wms.allocation.dto.request.AllocationDetailRequest;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_allocation_detail", schema = "various")
@IdClass(AllocationDetailId.class)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationDetail {

    @Id
    @Column(name = "allocation_no")
    @Comment("할당 번호")
    private String allocationNo;

    @Id
    @Column(name = "seq_no")
    @Comment("할당 순번")
    private Integer seqNo;

    @Column(name = "item_id", nullable = false)
    @Comment("품목 ID")
    private Long itemId;

    @Column(name = "allocated_qty", precision = 18, scale = 4, nullable = false)
    @Comment("할당 수량")
    private BigDecimal allocatedQty;

    @Column(name = "inventory_id")
    @Comment("차감된 재고 ID")
    private Long inventoryId;

    @Column(name = "location_code", length = 15)
    @Comment("로케이션 코드")
    private String locationCode;

    @Column(name = "lot_no", length = 50)
    @Comment("로트 번호")
    private String lotNo;

    @Column(name = "expire_date", length = 10)
    @Comment("유효 기한")
    private String expireDate;

    @Column(name = "make_date", length = 10)
    @Comment("제조 일자")
    private String makeDate;

    @Column(name = "make_no", length = 50)
    @Comment("제조 번호")
    private String makeNo;

    @Column(name = "ref_type", length = 20)
    @Comment("연관 유형 (OUTBOUND, PACKING 등)")
    private String refType;

    @Column(name = "ref_id")
    @Comment("연관 ID")
    private Long refId;

    public void updateFrom(AllocationDetailRequest req) {
        this.itemId = req.getItemId();
        this.allocatedQty = req.getAllocatedQty();
        this.locationCode = req.getLocationCode();
        this.lotNo = req.getLotNo();
        this.makeDate = req.getMakeDate();
        this.expireDate = req.getExpireDate();
        this.makeNo = req.getMakeNo();
        this.refType = req.getRefType();
        this.refId = req.getRefId();
    }
}
