package com.bizcof.wms.outbound.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OutboundDetailId implements Serializable {
    private String outboundNo;
    private Integer seqNo;


    // equals, hashCode 필수
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OutboundDetailId that)) return false;
        return Objects.equals(outboundNo, that.outboundNo) && Objects.equals(seqNo, that.seqNo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(outboundNo, seqNo);
    }
}