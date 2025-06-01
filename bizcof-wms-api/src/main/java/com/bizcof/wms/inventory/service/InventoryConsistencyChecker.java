package com.bizcof.wms.inventory.service;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.repository.InventoryRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryConsistencyChecker {

    private final InventoryRepository inventoryRepository;
    private final StringRedisTemplate redisTemplate;
    private HashOperations<String, String, String> hashOps;

    @PostConstruct
    public void init() {
        this.hashOps = redisTemplate.opsForHash();
    }

    public void checkRedisConsistency(boolean autoRepair) {
        List<Inventory> inventories = inventoryRepository.findAll();
        int mismatchCount = 0;

        for (Inventory inv : inventories) {
            String key = buildRedisKey(inv);

            Map<String, String> redisMap = hashOps.entries(key);
            BigDecimal rTotal = new BigDecimal(redisMap.getOrDefault("total_qty", "0"));
            BigDecimal rAlloc = new BigDecimal(redisMap.getOrDefault("allocated_qty", "0"));
            BigDecimal rHold  = new BigDecimal(redisMap.getOrDefault("hold_qty", "0"));

            boolean mismatch =
                    inv.getTotalQty().compareTo(rTotal) != 0 ||
                    inv.getAllocatedQty().compareTo(rAlloc) != 0 ||
                    inv.getHoldQty().compareTo(rHold) != 0;

            if (mismatch) {
                mismatchCount++;
                log.warn("❗정합성 오류 [{}]: DB(total={}, alloc={}, hold={}) vs Redis(total={}, alloc={}, hold={})",
                        key,
                        inv.getTotalQty(), inv.getAllocatedQty(), inv.getHoldQty(),
                        rTotal, rAlloc, rHold);

                if (autoRepair) {
                    hashOps.put(key, "total_qty", inv.getTotalQty().toPlainString());
                    hashOps.put(key, "allocated_qty", inv.getAllocatedQty().toPlainString());
                    hashOps.put(key, "hold_qty", inv.getHoldQty().toPlainString());
                    log.info("✅ Redis 복구 완료: {}", key);
                }
            }
        }

        log.info("🔍 Redis 정합성 검사 완료 - 총 불일치: {}", mismatchCount);
    }

    private String buildRedisKey(Inventory inv) {
        return String.format("stock:%d:%s:%s:%s:%s:%s",
                inv.getItemId(),
                inv.getLocationCode(),
                inv.getLotNo(),
                inv.getMakeDate(),
                inv.getExpireDate(),
                inv.getMakeNo());
    }
}