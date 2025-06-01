package com.bizcof.wms.inventory.strategy.impl;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.strategy.InventoryStrategy;
import org.springframework.stereotype.Component;

@Component
public class RollbackAllocateStrategy implements InventoryStrategy {

    @Override
    public InventoryEventType getEventType() {
        return InventoryEventType.ROLLBACK_ALLOCATE;
    }

    @Override
    public void apply(Inventory inventory, InventoryEventMessage message) {
        inventory.releaseAllocation(message.getChangeQty()); // allocatedQty -=
    }
}