package com.bizcof.wms.master.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_bom", schema = "various")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Bom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bom_id")
    @Comment("BOM ID")
    private Long id;

    @Column(name = "parent_bom_id")
    @Comment("BOM Parent ID")
    private Long parentBomId;

    @Column(name = "top_item_id", nullable = false)
    @Comment("최상위 품목 ID (완제품)")
    private Long topItemId;

    @Column(name = "parent_item_id", nullable = false)
    @Comment("상위 품목 ID")
    private Long parentItemId;

    @Column(name = "child_item_id", nullable = false)
    @Comment("하위 품목 ID (자재)")
    private Long childItemId;

    @Column(name = "required_qty", nullable = false, precision = 18, scale = 4)
    @Comment("소요 수량")
    private java.math.BigDecimal requiredQty;

    @Column(name = "sort_order")
    @Comment("표시 순서")
    private Integer sortOrder;

    @Column(name = "memo", length = 200)
    @Comment("비고")
    private String memo;

    public void update(BigDecimal requiredQty, Integer sortOrder, String memo) {
        this.requiredQty = requiredQty;
        this.sortOrder = sortOrder;
        this.memo = memo;
    }
}