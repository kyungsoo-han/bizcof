package com.bizcof.wms.inventory.repository.querydsl;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.QInventory;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
@RequiredArgsConstructor
public class InventoryQueryRepository {
    private final JPAQueryFactory queryFactory;

        public List<Inventory> findAvailableInventories(Long itemId) {
            QInventory inventory = QInventory.inventory;

            return queryFactory.selectFrom(inventory)
                    .where(
                        inventory.itemId.eq(itemId),
                        inventory.totalQty.gt(inventory.allocatedQty),
                        inventory.inventoryStatus.eq("NORMAL")
                    )
                    .fetch();
        }
}
