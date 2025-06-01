package com.bizcof.wms.outbound.domain;

import com.bizcof.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "t_outbound_detail", schema = "various")
@IdClass(OutboundDetailId.class)
@Builder
public class OutboundDetail extends BaseEntity {

    @Id
    @Column(name = "outbound_no", length = 20)
    private String outboundNo;

    @Id
    @Column(name = "seq_no")
    private Integer seqNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "outbound_no", insertable = false, updatable = false)
    private OutboundHeader outboundHeader;

    @Column(name = "item_id")
    private Long itemId;

    @Column(name = "plt_qty")
    private BigDecimal pltQty;

    @Column(name = "box_qty")
    private BigDecimal boxQty;

    @Column(name = "outbound_qty")
    private BigDecimal outboundQty;

    @Column(name = "location_code", length = 15)
    private String locationCode;

    @Column(name = "expire_date", length = 10)
    private String expireDate;

    @Column(name = "make_date", length = 10)
    private String makeDate;

    @Column(name = "make_no", length = 50)
    private String makeNo;

    @Column(name = "lot_no", length = 50)
    private String lotNo;

    @Column(name = "memo", length = 500)
    private String memo;

    @Column(name = "outbound_req_id")
    @Comment("출고 요청 ID")
    private Long outboundReqId;

    @Column(name = "allocation_no")
    @Comment("할당 번호")
    private Long allocationNo;

    @Column(name = "allocation_seq_no")
    @Comment("할당 순번")
    private Long allocationSeqNo;

    @Column(name = "picking_no")
    @Comment("피킹 번호")
    private Long pickingNo;

    @Column(name = "picking_seq_no")
    @Comment("피킹 순번")
    private Long pickingSeqNo;



}