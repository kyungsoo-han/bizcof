package com.bizcof.wms.inventory.strategy;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;

/**
 * ✅ 전략 패턴 인터페이스
 * - 이벤트 타입별 재고 반영 전략
 */
public interface InventoryStrategy {
    InventoryEventType getEventType();
    void apply(Inventory inventory, InventoryEventMessage message);
}

