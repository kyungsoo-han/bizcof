package com.bizcof.wms.inventory.strategy.impl;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.strategy.InventoryStrategy;
import org.springframework.stereotype.Component;

/** ROLLBACK_IN 전략 (출고 취소) → 수량 증가 */
@Component
public class RollbackInStrategy implements InventoryStrategy {

    @Override
    public InventoryEventType getEventType() {
        return InventoryEventType.ROLLBACK_IN;
    }
    @Override
    public void apply(Inventory inventory, InventoryEventMessage message) {
        inventory.addQuantity(message.getChangeQty());
    }
}

