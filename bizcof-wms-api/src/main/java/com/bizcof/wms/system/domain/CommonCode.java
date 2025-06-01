package com.bizcof.wms.system.domain;


import com.querydsl.core.annotations.QueryEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "t_common_code", schema = "various")
@IdClass(CommonCodeId.class)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommonCode {

    @Id
    @Column(name = "group_code", length = 50, nullable = false)
    @Comment("그룹 코드")
    private String groupCode;

    @Id
    @Column(name = "common_code", length = 10, nullable = false)
    @Comment("코드")
    private String commonCode;

    @Column(name = "common_name", length = 1000, nullable = false)
    @Comment("명칭")
    private String commonName;

    @Column(name = "remark", length = 1000)
    @Comment("비고")
    private String remark;

    @Column(name = "use_yn", columnDefinition = "char(1) default 'Y'", nullable = false)
    @Comment("사용여부")
    private String useYn = "Y";

    @Column(name = "sort_order", columnDefinition = "int default 0", nullable = false)
    @Comment("순서")
    private int sortOrder = 0;

    @Column(name = "string1", length = 100)
    private String string1;

    @Column(name = "string2", length = 100)
    private String string2;

    @Column(name = "string3", length = 100)
    private String string3;

    @Column(name = "string4", length = 100)
    private String string4;

    @Column(name = "number1")
    private Integer number1;

    @Column(name = "number2")
    private Integer number2;

    @Column(name = "number3")
    private Integer number3;

    @Column(name = "number4")
    private Integer number4;

    @Column(name = "sub_remark", length = 1000)
    private String subRemark;

    @Column(name = "created_id", length = 50)
    private String createdId;

    @Column(name = "created_dt")
    private LocalDateTime createdDt;

    @Column(name = "modified_id", length = 50)
    private String modifiedId;

    @Column(name = "modified_dt")
    private LocalDateTime modifiedDt;
}
