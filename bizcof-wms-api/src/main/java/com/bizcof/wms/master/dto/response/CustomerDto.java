package com.bizcof.wms.master.dto.response;

import com.bizcof.wms.master.domain.Customer;
import com.querydsl.core.annotations.QueryProjection;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class CustomerDto {
    private Long id;
    private String code;
    private String name;

    @QueryProjection
        public CustomerDto(Long id, String code, String name) {
            this.id = id;
            this.code = code;
            this.name = name;
        }

    public Customer toEntity() {
        return Customer.of(
                code,
                name
        );
    }
}