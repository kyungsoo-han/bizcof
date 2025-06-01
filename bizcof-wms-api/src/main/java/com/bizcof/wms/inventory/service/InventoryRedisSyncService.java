package com.bizcof.wms.inventory.service;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.repository.InventoryRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryRedisSyncService {

    private final InventoryRepository inventoryRepository;
    private final StringRedisTemplate redisTemplate;
    private HashOperations<String, String, String> hashOps;

    @PostConstruct
    public void init() {
        this.hashOps = redisTemplate.opsForHash();
    }

    /**
     * ✅ Redis 재초기화 (DB 기준)
     */
    public void syncRedisFromDb() {
        List<Inventory> inventories = inventoryRepository.findAll();

        for (Inventory inv : inventories) {
            String key = buildRedisKey(inv);

            hashOps.put(key, "total_qty", inv.getTotalQty().toPlainString());
            hashOps.put(key, "allocated_qty", inv.getAllocatedQty().toPlainString());
            hashOps.put(key, "hold_qty", inv.getHoldQty().toPlainString());

            log.info("✅ Redis 재갱신 완료: {}", key);
        }
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