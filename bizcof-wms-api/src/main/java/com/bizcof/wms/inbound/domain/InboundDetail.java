package com.bizcof.wms.inbound.domain;

import com.bizcof.common.domain.BaseEntity;
import com.bizcof.wms.inbound.dto.request.InboundDetailRequest;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "t_inbound_detail")
@IdClass(InboundDetailId.class)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboundDetail extends BaseEntity {

    @Id
    @Column(name = "inbound_no", length = 20)
    private String inboundNo;

    @Id
    @Column(name = "seq_no")
    private Integer seqNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inbound_no", insertable = false, updatable = false)
    private InboundHeader inboundHeader;

    @Column(name = "item_id", columnDefinition = "품목 ID")
    private Long itemId;

    @Column(name = "plt_qty", precision = 18, scale = 4, columnDefinition = "팔레트 수량")
    private BigDecimal pltQty;

    @Column(name = "box_qty", precision = 18, scale = 4, columnDefinition = "박스 수량")
    private BigDecimal boxQty;

    @Column(name = "inbound_qty", precision = 18, scale = 4, columnDefinition = "입고 수량")
    private BigDecimal inboundQty;

    @Column(name = "location_code", length = 15, columnDefinition = "로케이션")
    private String locationCode;

    @Column(name = "expire_date", length = 10, columnDefinition = "유효 기한")
    private String expireDate;

    @Column(name = "make_date", length = 10, columnDefinition = "제조 일자")
    private String makeDate;

    @Column(name = "make_no", length = 50, columnDefinition = "제조 번호")
    private String makeNo;

    @Column(name = "lot_no", length = 50, columnDefinition = "LOT 번호")
    private String lotNo;

    @Column(name = "memo", length = 500, columnDefinition = "메모")
    private String memo;


    public void updateFrom(InboundDetailRequest req) {
            this.itemId = req.getItemId();
            this.pltQty = req.getPltQty();
            this.boxQty = req.getBoxQty();
            this.inboundQty = req.getInboundQty();
            this.locationCode = req.getLocationCode();
            this.expireDate = req.getExpireDate();
            this.makeDate = req.getMakeDate();
            this.makeNo = req.getMakeNo();
            this.lotNo = req.getLotNo();
            this.memo = req.getMemo();
        }


}