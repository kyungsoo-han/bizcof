package com.bizcof.wms.inventory.strategy;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.strategy.constants.AllocationStrategyType;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public class InventorySortStrategyFactory {
    public static List<Inventory> sort(AllocationStrategyType type, List<Inventory> inventories) {
            return switch (type) {
                case MAKE_DATE -> inventories.stream()
                        .sorted(Comparator.comparing(Inventory::getMakeDate, Comparator.nullsLast(String::compareTo)))
                        .toList();
                case EXPIRE_DATE -> inventories.stream()
                        .sorted(Comparator.comparing(Inventory::getExpireDate, Comparator.nullsLast(String::compareTo)))
                        .toList();
                case INBOUND_DATE -> inventories.stream()
                        .sorted(Comparator.comparing(Inventory::getLastInboundDt, Comparator.nullsLast(LocalDateTime::compareTo)))
                        .toList();
            };
        }
}
