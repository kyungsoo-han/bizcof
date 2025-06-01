package com.bizcof.wms.outbound.domain;

import com.bizcof.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "t_outbound_request", schema = "various")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboundRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "outbound_req_id")
    private Long outboundReqId;

    @Column(name = "outbound_req_date", length = 10, nullable = false)
    private String outboundReqDate;

    @Column(name = "outbound_exp_date", length = 10, nullable = false)
    private String outboundExpDate;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "destination_id", nullable = false)
    private Long destinationId;

    @Column(name = "outbound_type", length = 10)
    private String outboundType;

    @Column(name = "memo", length = 500)
    private String memo;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "request_qty", precision = 18, scale = 4, nullable = false)
    private BigDecimal requestQty;

    @Column(name = "memo2", length = 500)
    private String memo2;
}