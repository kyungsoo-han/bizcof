package com.bizcof.wms.allocation.domain;

import com.bizcof.common.domain.BaseEntity;
import com.bizcof.wms.allocation.domain.constant.AllocationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "t_allocation_header", schema = "various")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationHeader extends BaseEntity {

    @Id
    @Column(name = "allocation_no")
    @Comment("할당 번호")
    private String allocationNo;

    @Column(name = "allocation_date", length = 10)
    @Comment("할당일")
    private String allocationDate;

    @Column(name = "allocation_type", length = 20, nullable = false)
    @Comment("할당 유형 (OUTBOUND, PACKING)")
    private AllocationType allocationType;

    @Column(name = "status", length = 10)
    @Comment("상태")
    private String status;

    @Column(name = "memo", length = 500)
    @Comment("메모")
    private String memo;


    public void update(String allocationDate, AllocationType allocationType, String memo) {
        this.allocationDate = allocationDate;
        this.allocationType = allocationType;
        this.memo = memo;
    }
}
