package com.bizcof.wms.inventory.strategy.impl;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.strategy.InventoryStrategy;
import org.springframework.stereotype.Component;

/** MOVE_IN 전략 (입고와 동일) */
@Component
public class MoveInStrategy implements InventoryStrategy {
    @Override
    public InventoryEventType getEventType() {
        return InventoryEventType.MOVE_IN;
    }

    @Override
    public void apply(Inventory inventory, InventoryEventMessage message) {
        inventory.addQuantity(message.getChangeQty());
    }
}