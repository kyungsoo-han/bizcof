package com.bizcof.wms.inventory.strategy.impl;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.strategy.InventoryStrategy;
import org.springframework.stereotype.Component;

@Component
public class AllocateInventoryStrategy implements InventoryStrategy {

    @Override
    public InventoryEventType getEventType() {
        return InventoryEventType.ALLOCATE;
    }

    @Override
    public void apply(Inventory inventory, InventoryEventMessage message) {
        inventory.allocate(message.getChangeQty().abs()); // 양수로 변환 후 할당
    }
}