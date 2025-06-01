
package com.bizcof.wms.master.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 코드 + 명칭 간단 조회 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerModalDto {
    private Long id;
    private String code;
    private String name;
}
