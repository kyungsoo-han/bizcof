package com.bizcof.wms.system.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "공통코드 응답 DTO")
public class CommonCodeResponse  implements Serializable {

    @Schema(description = "공통 코드", example = "NORMAL")
    private String commonCode;

    @Schema(description = "공통 코드명", example = "일반입고")
    private String commonName;

}