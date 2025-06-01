package com.bizcof.wms.outbound.domain;

import com.bizcof.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "t_outbound_header")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutboundHeader extends BaseEntity {

    @Id
    @Column(name = "outbound_no", length = 20)
    private String outboundNo;

    @Column(name = "outbound_date", length = 10)
    private String outboundDate;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "outbound_type", length = 10)
    private String outboundType;

    @Column(name = "memo", length = 500)
    private String memo;

}