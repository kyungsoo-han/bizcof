package com.bizcof.wms.allocation.domain;


import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AllocationDetailId implements Serializable {

    private String allocationNo;
    private Integer seqNo;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AllocationDetailId)) return false;
        AllocationDetailId that = (AllocationDetailId) o;
        return Objects.equals(allocationNo, that.allocationNo)
                && Objects.equals(seqNo, that.seqNo);
    }

    @Override
    public int hashCode() {
        return Objects.hash(allocationNo, seqNo);
    }
}