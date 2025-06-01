package com.bizcof.wms.allocation.service;

import com.bizcof.wms.allocation.domain.AllocationDetail;
import com.bizcof.wms.allocation.domain.AllocationDetailId;
import com.bizcof.wms.allocation.domain.AllocationHeader;
import com.bizcof.wms.allocation.domain.constant.AllocationType;
import com.bizcof.wms.allocation.dto.request.AllocationCreateRequest;
import com.bizcof.wms.allocation.dto.request.AllocationDetailRequest;
import com.bizcof.wms.allocation.repository.AllocationDetailRepository;
import com.bizcof.wms.allocation.repository.AllocationHeaderRepository;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.events.InventoryEventPublisher;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.service.InventoryQueryService;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class AllocationService {

    private final AllocationHeaderRepository allocationHeaderRepository;
    private final AllocationDetailRepository allocationDetailRepository;
    private final AllocationNumberGenerator allocationNumberGenerator;
    private final InventoryEventPublisher inventoryEventPublisher;
    private final InventoryQueryService inventoryQueryService; // ✅ Redis 가용재고 조회

    /**
     * 할당 생성 (가용재고 검증 → 저장 → Kafka 발행)
     */
    @Transactional
    public void createAllocation(AllocationCreateRequest request) {
        // 1. 할당 번호 생성
        String allocationNo = allocationNumberGenerator.generateAllocationNo();

        // 2. 헤더 저장
        AllocationHeader header = AllocationHeader.builder()
                .allocationNo(allocationNo)
                .allocationDate(request.getAllocationDate())
                .allocationType(request.getAllocationType())
                .status("ALLOCATED")
                .memo(request.getMemo())
                .build();
        allocationHeaderRepository.save(header);

        // 3. 상세 저장 준비 및 Kafka 이벤트 준비
        List<AllocationDetail> details = new ArrayList<>();
        List<InventoryEventMessage> events = new ArrayList<>();
        int seq = 0;

        for (AllocationDetailRequest item : request.getItems()) {
            AllocationDetail detail = item.toEntity(allocationNo, ++seq);
            details.add(detail);

            InventoryEventMessage event = InventoryEventMessage.builder()
                    .eventType(InventoryEventType.ALLOCATE)
                    .itemId(detail.getItemId())
                    .locationCode(detail.getLocationCode())
                    .lotNo(detail.getLotNo())
                    .makeDate(detail.getMakeDate())
                    .expireDate(detail.getExpireDate())
                    .makeNo(detail.getMakeNo())
                    .changeQty(detail.getAllocatedQty())
                    .inventoryStatus("NORMAL")
                    .refType(request.getAllocationType().name())
                    .refNo(allocationNo)
                    .refSeq(detail.getSeqNo())
                    .actor("system")
                    .build();

            // ✅ 가용재고 확인
            BigDecimal availableQty = inventoryQueryService.getAvailableQty(event);
            log.info("availableQty = {}", availableQty);
            if (availableQty.compareTo(detail.getAllocatedQty()) < 0) {
                throw new IllegalStateException(String.format(
                        "[할당불가] 가용재고 부족 - 요청수량: %s, 가용재고: %s (itemId: %d, location: %s)",
                        detail.getAllocatedQty(), availableQty, detail.getItemId(), detail.getLocationCode()));
            }

            events.add(event);
        }

        // 4. 상세 저장 (트랜잭션 내)
        allocationDetailRepository.saveAll(details);

        // 5. Kafka 발행 (DB 저장 후)
        for (InventoryEventMessage event : events) {
            inventoryEventPublisher.publishInventoryEvent(event);
        }
    }

    @Transactional
    public void deleteAllocationItem(String allocationNo, Integer seqNo) {
        AllocationDetailId id = new AllocationDetailId(allocationNo, seqNo);
        AllocationDetail detail = allocationDetailRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 할당 상세 항목이 존재하지 않습니다."));

        // Kafka 롤백 이벤트 발행
        inventoryEventPublisher.publishInventoryEvent(InventoryEventMessage.builder()
                .eventType(InventoryEventType.ROLLBACK_ALLOCATE)
                .itemId(detail.getItemId())
                .locationCode(detail.getLocationCode())
                .lotNo(detail.getLotNo())
                .makeDate(detail.getMakeDate())
                .expireDate(detail.getExpireDate())
                .makeNo(detail.getMakeNo())
                .changeQty(detail.getAllocatedQty())
                .inventoryStatus("NORMAL")
                .refType(detail.getRefType())
                .refNo(allocationNo)
                .refSeq(seqNo)
                .actor("system")
                .build());

        allocationDetailRepository.delete(detail);
    }

    @Transactional
    public void deleteAllocation(String allocationNo) {
        List<AllocationDetail> details = allocationDetailRepository.findByAllocationNo(allocationNo);

        for (AllocationDetail detail : details) {
            inventoryEventPublisher.publishInventoryEvent(InventoryEventMessage.builder()
                    .eventType(InventoryEventType.ROLLBACK_ALLOCATE)
                    .itemId(detail.getItemId())
                    .locationCode(detail.getLocationCode())
                    .lotNo(detail.getLotNo())
                    .makeDate(detail.getMakeDate())
                    .expireDate(detail.getExpireDate())
                    .makeNo(detail.getMakeNo())
                    .changeQty(detail.getAllocatedQty())
                    .inventoryStatus("NORMAL")
                    .refType(detail.getRefType())
                    .refNo(allocationNo)
                    .refSeq(detail.getSeqNo())
                    .actor("system")
                    .build());
        }

        allocationDetailRepository.deleteAll(details);
        allocationHeaderRepository.deleteById(allocationNo);
    }
}