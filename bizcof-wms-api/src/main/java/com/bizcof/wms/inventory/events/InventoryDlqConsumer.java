package com.bizcof.wms.inventory.events;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryDlqConsumer {

    private final List<String> failedMessages = new CopyOnWriteArrayList<>();

    @KafkaListener(topics = "inventory-events-dlq", groupId = "wms-dlq-monitor")
    public void handleDlq(String message) {
        log.warn("[DLQ] 재고 처리 실패 메시지 수신: {}", message);
        failedMessages.add(message); // 메모리 저장 (간단한 예시)
    }

    public List<String> getFailedMessages() {
        return failedMessages;
    }
}