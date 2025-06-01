package com.bizcof.wms.inventory.controller.api;

import com.bizcof.wms.inventory.service.InventoryConsistencyChecker;
import com.bizcof.wms.inventory.service.InventoryRedisSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/inventory")
public class InventoryAdminController {

    private final InventoryRedisSyncService inventoryRedisSyncService;
    private final InventoryConsistencyChecker consistencyChecker;

    @PostMapping("/sync-redis")
    public ResponseEntity<String> syncRedis() {
        inventoryRedisSyncService.syncRedisFromDb();
        return ResponseEntity.ok("✅ Redis 재고 데이터가 DB 기준으로 초기화되었습니다.");
    }


    @PostMapping("/check-consistency")
    public ResponseEntity<String> checkConsistency(@RequestParam(defaultValue = "false") boolean repair) {
        consistencyChecker.checkRedisConsistency(repair);
        return ResponseEntity.ok("🔍 Redis 정합성 검사가 완료되었습니다.");
    }

}