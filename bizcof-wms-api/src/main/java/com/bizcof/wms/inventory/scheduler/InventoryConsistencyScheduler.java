package com.bizcof.wms.inventory.scheduler;

import com.bizcof.wms.inventory.service.InventoryConsistencyChecker;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InventoryConsistencyScheduler {

    private final InventoryConsistencyChecker checker;

    /**
     * ⏱️ 매 5분마다 Redis 정합성 검증 수행 (복구는 안 함)
     */
    @Scheduled(cron = "0 */5 * * * *") // 매 5분
    public void autoCheck() {
        checker.checkRedisConsistency(false);
    }
}
