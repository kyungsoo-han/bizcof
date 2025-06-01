package com.bizcof.wms.master.dto.request;


import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class BomSaveRequest {
    private Long topItemId;
    private List<BomDetailRequest> rows;
}