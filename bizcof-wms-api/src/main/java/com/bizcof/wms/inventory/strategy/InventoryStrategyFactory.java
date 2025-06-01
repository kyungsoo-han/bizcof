package com.bizcof.wms.inventory.strategy;

import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ✅ 전략 매핑 팩토리 (DI 기반, Enum 기반)
 */
@Component
@RequiredArgsConstructor
public class InventoryStrategyFactory {

    private final List<InventoryStrategy> strategies;
    private final Map<InventoryEventType, InventoryStrategy> strategyMap = new HashMap<>();

    @PostConstruct
    public void init() {
        for (InventoryStrategy strategy : strategies) {
            strategyMap.put(strategy.getEventType(), strategy);
        }
    }

    public InventoryStrategy getStrategy(InventoryEventMessage message) {
        InventoryEventType eventType = message.getEventType();
        if (!strategyMap.containsKey(eventType)) {
            throw new UnsupportedOperationException("지원하지 않는 이벤트 타입: " + eventType);
        }
        return strategyMap.get(eventType);
    }
}
