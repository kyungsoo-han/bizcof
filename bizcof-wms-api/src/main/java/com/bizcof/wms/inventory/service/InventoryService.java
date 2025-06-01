package com.bizcof.wms.inventory.service;

import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.InventoryHistory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.repository.InventoryHistoryRepository;
import com.bizcof.wms.inventory.repository.InventoryRepository;
import com.bizcof.wms.inventory.strategy.InventoryStrategy;
import com.bizcof.wms.inventory.strategy.InventoryStrategyFactory;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@RequiredArgsConstructor
@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final StringRedisTemplate redisTemplate;
    private final InventoryStrategyFactory inventoryStrategyFactory;

    private static final String REDIS_KEY_PREFIX = "stock";
    private HashOperations<String, String, String> hashOps;

    @PostConstruct
    public void init() {
        this.hashOps = redisTemplate.opsForHash();
    }

    /**
     * ✅ Kafka로부터 수신된 재고 이벤트 처리
     */
    @Transactional
    public void processEvent(InventoryEventMessage event) {
        log.info("📦 재고 이벤트 수신: {}", event);

        validateEvent(event);
        String redisKey = buildRedisKey(event);
        double qty = event.getChangeQty().doubleValue();

        // 1. Redis 반영: 이벤트 타입에 따라 처리
        switch (event.getEventType()) {
            case INBOUND, ADJUST_PLUS, ROLLBACK_IN, MOVE_IN -> increment(redisKey, "total_qty", qty);
            case OUTBOUND, ADJUST_MINUS, ROLLBACK_OUT, MOVE_OUT -> increment(redisKey, "total_qty", -qty);
            case ALLOCATE -> increment(redisKey, "allocated_qty", qty);
            case ROLLBACK_ALLOCATE -> increment(redisKey, "allocated_qty", -qty);
            default -> log.warn("❗지원하지 않는 이벤트 타입: {}", event.getEventType());
        }

        // 2. Inventory DB 조회 또는 신규 생성
        Inventory inventory = inventoryRepository.findByUniqueKey(
                event.getItemId(), event.getLocationCode(), event.getLotNo(),
                event.getMakeDate(), event.getExpireDate(), event.getMakeNo()
        ).orElseGet(() -> Inventory.builder()
                .itemId(event.getItemId())
                .locationCode(event.getLocationCode())
                .lotNo(event.getLotNo())
                .makeDate(event.getMakeDate())
                .expireDate(event.getExpireDate())
                .makeNo(event.getMakeNo())
                .totalQty(BigDecimal.ZERO)
                .allocatedQty(BigDecimal.ZERO)
                .holdQty(BigDecimal.ZERO)
                .inventoryStatus(event.getInventoryStatus() != null ? event.getInventoryStatus() : "NORMAL")
                .build()
        );

        BigDecimal beforeQty = inventory.getTotalQty();

        // 3. 전략 적용 (DB 수량 반영)
        InventoryStrategy strategy = inventoryStrategyFactory.getStrategy(event);
        strategy.apply(inventory, event);
        inventoryRepository.save(inventory);

        // 4. 이력 저장
        inventoryHistoryRepository.save(InventoryHistory.builder()
                .inventory(inventory)
                .itemId(event.getItemId())
                .locationCode(event.getLocationCode())
                .lotNo(event.getLotNo())
                .makeDate(event.getMakeDate())
                .expireDate(event.getExpireDate())
                .makeNo(event.getMakeNo())
                .changeQty(event.getChangeQty())
                .beforeQty(beforeQty)
                .afterQty(inventory.getTotalQty())
                .historyType(event.getEventType().name())
                .refType(event.getRefType())
                .refNo(event.getRefNo())
                .refSeq(event.getRefSeq())
                .inventoryStatus(inventory.getInventoryStatus())
                .build()
        );
    }

    /**
     * Redis 필드 증가 함수
     */
    private void increment(String redisKey, String field, double delta) {
        hashOps.increment(redisKey, field, delta);
        log.info("🔄 Redis 반영: {} {} → {}", redisKey, field, delta);
    }

    /**
     * Redis 키 생성
     */
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

    /**
     * 이벤트 필수값 검증
     */
    private void validateEvent(InventoryEventMessage e) {
        if (e.getItemId() == null || e.getChangeQty() == null || e.getChangeQty().compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("❌ 잘못된 재고 이벤트: 필수 필드 누락 또는 0 수량");
        }
        if (e.getChangeQty().compareTo(BigDecimal.ZERO) < 0 &&
            (e.getEventType() == InventoryEventType.ROLLBACK_ALLOCATE ||
             e.getEventType() == InventoryEventType.ROLLBACK_IN ||
             e.getEventType() == InventoryEventType.ROLLBACK_OUT)) {
            throw new IllegalArgumentException("❌ 롤백 이벤트는 양수 수량이어야 합니다.");
        }
    }
}