package com.bizcof.wms.inventory.strategy.impl;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.strategy.InventoryStrategy;
import org.springframework.stereotype.Component;


/** ADJUST_MINUS 전략 (조정: 수량 감소) */
@Component
public class AdjustMinusStrategy implements InventoryStrategy {

    @Override
    public InventoryEventType getEventType() {
        return InventoryEventType.ADJUST_MINUS;
    }

    @Override
    public void apply(Inventory inventory, InventoryEventMessage message) {
        inventory.subtractQuantity(message.getChangeQty());
    }
}