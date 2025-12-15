package com.bizcof.wms.system.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "t_code_group", schema = "bizcof",
    uniqueConstraints = @UniqueConstraint(columnNames = "group_code"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("ID")
    private Long id;

    @Column(name = "group_code", length = 20, nullable = false, unique = true)
    @Comment("그룹 코드")
    private String groupCode;

    @Column(name = "name", length = 100, nullable = false)
    @Comment("그룹명")
    private String name;

    @Column(name = "description", length = 500)
    @Comment("설명")
    private String description;

    @Column(name = "use_yn", columnDefinition = "char(1) default 'Y'", nullable = false)
    @Comment("사용여부")
    @Builder.Default
    private String useYn = "Y";

    @Column(name = "sort_order", columnDefinition = "int default 0", nullable = false)
    @Comment("정렬순서")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "created_id", length = 50)
    @Comment("등록자")
    private String createdId;

    @Column(name = "created_dt")
    @Comment("등록일시")
    private LocalDateTime createdDt;

    @Column(name = "modified_id", length = 50)
    @Comment("수정자")
    private String modifiedId;

    @Column(name = "modified_dt")
    @Comment("수정일시")
    private LocalDateTime modifiedDt;

    @PrePersist
    public void prePersist() {
        this.createdDt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.modifiedDt = LocalDateTime.now();
    }
}
