package com.bizcof.wms.inbound.domain;

import com.bizcof.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "t_inbound_header")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboundHeader extends BaseEntity {

    @Id
    @Column(name = "inbound_no")
    private String inboundNo;

    @Column(name = "inbound_date", length = 10, columnDefinition = "입고 일자")
    private String inboundDate;

    @Column(name = "customer_id", columnDefinition = "고객사 ID")
    private Long customerId;

    @Column(name = "inbound_type", length = 10, columnDefinition = "입고 타입")
    private String inboundType;


    @Column(name = "memo", length = 500, columnDefinition = "메모")
    private String memo;

    public void update(String inboundDate, Long customerId, String inboundType, String memo) {
           this.inboundDate = inboundDate;
           this.customerId = customerId;
           this.inboundType = inboundType;
           this.memo = memo;
       }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof InboundHeader that)) return false;
        return inboundNo != null && inboundNo.equals(that.getInboundNo());
    }
    @Override
    public int hashCode() {
        return Objects.hash(inboundNo);
    }
}