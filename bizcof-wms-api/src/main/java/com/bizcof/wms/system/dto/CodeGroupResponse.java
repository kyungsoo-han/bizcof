package com.bizcof.wms.system.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "코드 그룹 응답 DTO")
public class CodeGroupResponse implements Serializable {

    @Schema(description = "ID")
    private Long id;

    @Schema(description = "그룹 코드", example = "INBOUND_TYPE")
    private String groupCode;

    @Schema(description = "그룹명", example = "입고 타입")
    private String name;

    @Schema(description = "설명")
    private String description;

    @Schema(description = "사용여부", example = "Y")
    private String useYn;

    @Schema(description = "정렬순서")
    private Integer sortOrder;
}
