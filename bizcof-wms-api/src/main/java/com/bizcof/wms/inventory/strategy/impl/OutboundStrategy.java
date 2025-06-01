package com.bizcof.wms.inventory.strategy.impl;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.strategy.InventoryStrategy;
import org.springframework.stereotype.Component;

/**
 * ✅ 출고 전략 (수량 감소)
 */
@Component
public class OutboundStrategy implements InventoryStrategy {
    @Override
    public InventoryEventType getEventType() {
        return InventoryEventType.OUTBOUND;
    }

    @Override
    public void apply(Inventory inventory, InventoryEventMessage message) {
        inventory.subtractQuantity(message.getChangeQty());
    }
}