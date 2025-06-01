package com.bizcof.wms.inventory.events;

import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka를 통해 재고 이벤트 메시지를 발행하는 전용 Publisher
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private static final String TOPIC = "inventory-events";

    /**
     * InventoryEventMessage를 Kafka로 발행
     * @param message 재고 이벤트 메시지
     */
    public void publishInventoryEvent(InventoryEventMessage message) {
        try {
            String payload = objectMapper.writeValueAsString(message);
            kafkaTemplate.send(TOPIC, payload);
            log.info("[Kafka] 재고 이벤트 발행: {}", payload);
        } catch (JsonProcessingException e) {
            log.error("[Kafka] 메시지 직렬화 실패", e);
            // 예외 전파는 정책에 따라 결정 (failover 필요시 rethrow)
        }
    }
}