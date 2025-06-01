package com.bizcof.wms.inventory.events;

import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.service.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventConsumer {


    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final InventoryService inventoryService;

    /**
     * ✅ Kafka Listener: 재고 이벤트 수신
     * - 메시지를 역직렬화하여 핸들러로 위임
     */
    @KafkaListener(topics = "inventory-events", groupId = "wms-inventory")
    public void handle(String message) {
        try {
            InventoryEventMessage event = objectMapper.readValue(message, InventoryEventMessage.class);
            log.info("[Kafka] 재고 이벤트 수신: {}", event);
            inventoryService.processEvent(event);
        } catch (Exception e) {
            log.error("Kafka 메시지 처리 실패. DLQ 전송 대상 메시지: {}", message, e);
            kafkaTemplate.send("inventory-events-dlq", message); // DLQ로 보냄
        }
    }

}
