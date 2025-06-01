package com.bizcof.wms.inventory.strategy.impl;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.strategy.InventoryStrategy;
import org.springframework.stereotype.Component;

/** ADJUST_PLUS 전략 (조정: 수량 증가) */
@Component
public class AdjustPlusStrategy implements InventoryStrategy {
    @Override
    public InventoryEventType getEventType() {
        return InventoryEventType.ADJUST_PLUS;
    }

    @Override
    public void apply(Inventory inventory, InventoryEventMessage message) {
        inventory.addQuantity(message.getChangeQty());
    }
}