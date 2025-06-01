package com.bizcof.wms.inventory.service;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.repository.InventoryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class InventoryQueryService {

    private final StringRedisTemplate redisTemplate;
    private final InventoryRepository inventoryRepository;
    private static final String REDIS_KEY_PREFIX = "stock";

    /**
     * ✅ 가용재고 조회 (Redis → 없으면 DB 조회 후 Redis 채움)
     */
    public BigDecimal getAvailableQty(InventoryEventMessage e) {
        HashOperations<String, String, String> hashOps = redisTemplate.opsForHash();
        String redisKey = buildRedisKey(e);

        // 1. Redis 존재 여부 확인
        Boolean exists = redisTemplate.hasKey(redisKey);
        if (exists == null || !exists) {
            // 2. DB 조회
            Inventory inventory = inventoryRepository.findByUniqueKey(
                    e.getItemId(), e.getLocationCode(), e.getLotNo(),
                    e.getMakeDate(), e.getExpireDate(), e.getMakeNo()
            ).orElseThrow(()-> new EntityNotFoundException("할당 가능한 품목이 없습니다.")); // 없는 경우도 0으로 채움

            // 3. Redis backfill
            hashOps.put(redisKey, "total_qty", inventory.getTotalQty().toPlainString());
            hashOps.put(redisKey, "allocated_qty", inventory.getAllocatedQty().toPlainString());
            hashOps.put(redisKey, "hold_qty", inventory.getHoldQty().toPlainString());
        }

        // 4. Redis에서 가용재고 계산
        BigDecimal total = getQty(hashOps, redisKey, "total_qty");
        BigDecimal allocated = getQty(hashOps, redisKey, "allocated_qty");
        BigDecimal hold = getQty(hashOps, redisKey, "hold_qty");

        return total.subtract(allocated).subtract(hold);
    }

    private BigDecimal getQty(HashOperations<String, String, String> hashOps, String key, String field) {
        String raw = hashOps.get(key, field);
        if (raw == null || raw.isBlank()) return BigDecimal.ZERO;
        try {
            return new BigDecimal(raw);
        } catch (NumberFormatException e) {
            throw new IllegalStateException(String.format("Redis 필드값 형식 오류: key=%s field=%s value=%s", key, field, raw));
        }
    }

    private String buildRedisKey(InventoryEventMessage e) {
        return String.join(":",
                REDIS_KEY_PREFIX,
                String.valueOf(e.getItemId()),
                e.getLocationCode(),
                e.getLotNo(),
                e.getMakeDate(),
                e.getExpireDate(),
                e.getMakeNo()
        );
    }
}