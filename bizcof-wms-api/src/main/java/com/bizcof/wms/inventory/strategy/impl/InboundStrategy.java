package com.bizcof.wms.inventory.strategy.impl;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.strategy.InventoryStrategy;
import org.springframework.stereotype.Component;

/**
 * ✅ 입고 전략 (수량 증가)
 */
@Component
public class InboundStrategy implements InventoryStrategy {
    @Override
    public InventoryEventType getEventType() {
        return InventoryEventType.INBOUND;
    }

    @Override
    public void apply(Inventory inventory, InventoryEventMessage message) {
        inventory.addQuantity(message.getChangeQty());
    }
}
