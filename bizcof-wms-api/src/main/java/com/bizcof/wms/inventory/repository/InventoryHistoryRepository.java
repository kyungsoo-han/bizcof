package com.bizcof.wms.inventory.repository;

import com.bizcof.wms.inventory.domain.InventoryHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {
    // 필요 시 조회 메서드 추가 (예: 특정 재고 ID의 이력 조회 등)
}