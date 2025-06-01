package com.bizcof.wms.inventory.strategy.impl;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.strategy.InventoryStrategy;
import org.springframework.stereotype.Component;

/** MOVE_OUT 전략 (출고와 동일) */
@Component
public class MoveOutStrategy implements InventoryStrategy {
    @Override
    public InventoryEventType getEventType() {
        return InventoryEventType.MOVE_OUT;
    }
    @Override
    public void apply(Inventory inventory, InventoryEventMessage message) {
        inventory.subtractQuantity(message.getChangeQty());
    }
}