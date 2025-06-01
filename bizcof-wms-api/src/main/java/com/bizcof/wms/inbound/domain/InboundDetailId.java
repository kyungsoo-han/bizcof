package com.bizcof.wms.inbound.domain;


import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InboundDetailId implements Serializable {
    private String inboundNo;
    private Integer seqNo;
}