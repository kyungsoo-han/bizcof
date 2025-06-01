package com.bizcof.wms.inventory.message;

import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class InventoryEventMessage {
    private InventoryEventType eventType;     // Enum 기반
    private Long itemId;
    private String locationCode;
    private String lotNo;
    private String makeDate;
    private String expireDate;
    private String makeNo;

    private BigDecimal changeQty;  // 입고면 +, 출고면 - 로 통일
    private String inventoryStatus; // NORMAL, HOLD, EXPIRED 등
    private String reason;         // 변경 사유 (optional)

    private String refType;        // 참조 문서 타입 (예: INBOUND, OUTBOUND, MOVE 등)
    private String refNo;          // 참조 문서 번호
    private Integer refSeq;        // 참조 문서 순번

    private String actor;          // 처리자 ID or system
}       