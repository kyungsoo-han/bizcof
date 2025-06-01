package com.bizcof.wms.inbound.service;

import com.bizcof.wms.inbound.domain.InboundDetail;
import com.bizcof.wms.inbound.domain.InboundHeader;
import com.bizcof.wms.inbound.dto.request.InboundCreateRequest;
import com.bizcof.wms.inbound.dto.request.InboundDetailRequest;
import com.bizcof.wms.inbound.dto.request.InboundUpdateRequest;
import com.bizcof.wms.inbound.dto.request.search.SearchInboundRequest;
import com.bizcof.wms.inbound.dto.response.InboundDetailResponse;
import com.bizcof.wms.inbound.dto.response.InboundHeaderResponse;
import com.bizcof.wms.inbound.repository.InboundDetailRepository;
import com.bizcof.wms.inbound.repository.InboundHeaderRepository;
import com.bizcof.wms.inbound.repository.querydsl.InboundQueryRepository;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.events.InventoryEventPublisher;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class InboundService {

    private final InboundHeaderRepository inboundHeaderRepository;
    private final InboundDetailRepository inboundDetailRepository;
    private final InboundQueryRepository inboundQueryRepository;
    private final InboundNumberGenerator inboundNumberGenerator;
    private final InventoryEventPublisher inventoryEventPublisher;


    /**
     * 입고 등록 처리
     * - 입고번호 채번
     * - 입고 헤더 및 상세 정보 저장
     * - (예정) 재고 반영을 위한 Kafka 이벤트 발행
     */
    @Transactional
    public void createInbound(InboundCreateRequest request) {
        // 입고 번호 채번
        String inboundNo = inboundNumberGenerator.generateInboundNo();

        // 입고 헤더 생성 및 저장
        InboundHeader header = InboundHeader.builder()
                .inboundNo(inboundNo)
                .inboundDate(request.getInboundDate())
                .customerId(request.getCustomerId())
                .inboundType(request.getInboundType())
                .memo(request.getMemo())
                .build();
        inboundHeaderRepository.save(header);

        // 상세 리스트 생성 및 저장
        List<InboundDetail> details = new ArrayList<>();
        int seq = 0;
        for (InboundDetailRequest req : request.getItems()) {
            details.add(req.toEntity(inboundNo, ++seq));
        }
        inboundDetailRepository.saveAll(details);

        // Kafka 메시지 발행 (입고 상세 기준)
        for (InboundDetail detail : details) {
            inventoryEventPublisher.publishInventoryEvent(
                InventoryEventMessage.builder()
                    .eventType(InventoryEventType.INBOUND)
                    .itemId(detail.getItemId())
                    .locationCode(detail.getLocationCode())
                    .lotNo(detail.getLotNo())
                    .makeDate(detail.getMakeDate())
                    .expireDate(detail.getExpireDate())
                    .makeNo(detail.getMakeNo())
                    .changeQty(detail.getInboundQty())
                    .inventoryStatus("NORMAL")
                    .refType(InventoryEventType.INBOUND.name())
                    .refNo(inboundNo)
                    .refSeq(detail.getSeqNo())
                    .actor("system") // 또는 로그인 사용자 ID
                    .build()
            );
        }
    }

    /**
     * 입고 수정 처리
     * - 기존 헤더 정보 업데이트
     * - 상세 항목 중:
     *   → isDeleted = "Y" : 삭제
     *   → seqNo 존재      : 수정
     *   → seqNo 없음      : 신규 추가
     */
    @Transactional
    public void updateInbound(InboundUpdateRequest request) {

        System.out.println("request = " + request);
        // 헤더 존재 여부 확인
        InboundHeader header = inboundHeaderRepository.findById(request.getInboundNo())
                .orElseThrow(() -> new EntityNotFoundException("입고번호 없음"));

        // 헤더 필드 업데이트
        header.update(
                request.getInboundDate(),
                request.getCustomerId(),
                request.getInboundType(),
                request.getMemo()
        );

        // 기존 상세 목록 조회
        List<InboundDetail> existing = inboundDetailRepository.findByInboundNo(request.getInboundNo());
        Map<Integer, InboundDetail> existingMap = existing.stream()
                .collect(Collectors.toMap(InboundDetail::getSeqNo, d -> d));

        // 현재 최대 seqNo 계산
        int currentMaxSeq = existing.stream().mapToInt(InboundDetail::getSeqNo).max().orElse(0);
        List<InboundDetail> toInsert = new ArrayList<>();
        List<InboundDetail> toDelete = new ArrayList<>();

        for (InboundDetailRequest req : request.getItems()) {
            if ("Y".equalsIgnoreCase(req.getIsDeleted())) {
                if (req.getSeqNo() != null && existingMap.containsKey(req.getSeqNo())) {
                    toDelete.add(existingMap.get(req.getSeqNo()));
                }
                continue; // 삭제 대상은 나머지 처리 생략
            }

            if (req.getSeqNo() != null && existingMap.containsKey(req.getSeqNo())) {
                // 기존 항목 수정
                existingMap.get(req.getSeqNo()).updateFrom(req);
            } else {
                // 신규 항목 추가
                toInsert.add(req.toEntity(request.getInboundNo(), ++currentMaxSeq));
            }
        }

        // 신규 항목 저장
        if (!toInsert.isEmpty()) {
            inboundDetailRepository.saveAll(toInsert);
            // 신규 항목을 저장한 후 발행
            for (InboundDetail inserted : toInsert) {
                inventoryEventPublisher.publishInventoryEvent(
                    InventoryEventMessage.builder()
                        .eventType(InventoryEventType.INBOUND)
                        .itemId(inserted.getItemId())
                        .locationCode(inserted.getLocationCode())
                        .lotNo(inserted.getLotNo())
                        .makeDate(inserted.getMakeDate())
                        .expireDate(inserted.getExpireDate())
                        .makeNo(inserted.getMakeNo())
                        .changeQty(inserted.getInboundQty())
                        .inventoryStatus("NORMAL") // or 상태값 있을 경우
                        .refType(InventoryEventType.INBOUND.name())
                        .refNo(request.getInboundNo())
                        .refSeq(inserted.getSeqNo())
                        .actor("system") // 로그인 사용자 정보
                        .build()
                );
            }
        }

        // 품목 제거
        if (!toDelete.isEmpty()) {
            inboundDetailRepository.deleteAll(toDelete);

            // 삭제 항목은 입고 취소이므로 마이너스 발행
            for (InboundDetail deleted : toDelete) {
                inventoryEventPublisher.publishInventoryEvent(
                    InventoryEventMessage.builder()
                        .eventType(InventoryEventType.ROLLBACK_OUT)
                        .itemId(deleted.getItemId())
                        .locationCode(deleted.getLocationCode())
                        .lotNo(deleted.getLotNo())
                        .makeDate(deleted.getMakeDate())
                        .expireDate(deleted.getExpireDate())
                        .makeNo(deleted.getMakeNo())
                        .changeQty(deleted.getInboundQty()) //
                        .inventoryStatus("NORMAL") // 상태 정보 유지
                        .refType(InventoryEventType.INBOUND.name())
                        .refNo(request.getInboundNo())
                        .refSeq(deleted.getSeqNo())
                        .actor("system")
                        .build()
                );
            }
        }
    }

    /**
     * 입고 삭제 처리
     * - 헤더 및 관련 상세정보 전체 삭제
     */
    @Transactional
    public void deleteInbound(String inboundNo) {

        // 1. 삭제 전 상세 조회
        List<InboundDetail> details = inboundDetailRepository.findByInboundNo(inboundNo);

        // 2. Kafka 롤백 이벤트 발행
        for (InboundDetail detail : details) {
            inventoryEventPublisher.publishInventoryEvent(
                InventoryEventMessage.builder()
                    .eventType(InventoryEventType.ROLLBACK_OUT)
                    .itemId(detail.getItemId())
                    .locationCode(detail.getLocationCode())
                    .lotNo(detail.getLotNo())
                    .makeDate(detail.getMakeDate())
                    .expireDate(detail.getExpireDate())
                    .makeNo(detail.getMakeNo())
                    .changeQty(detail.getInboundQty())
                    .inventoryStatus("NORMAL")
                    .refType(InventoryEventType.INBOUND.name())
                    .refNo(inboundNo)
                    .refSeq(detail.getSeqNo())
                    .actor("system")
                    .build()
            );
        }


        inboundHeaderRepository.deleteById(inboundNo);
        inboundDetailRepository.deleteByInboundNo(inboundNo);
    }

    /**
     * 입고 목록 조회 (헤더)
     */
    @Transactional(readOnly = true)
    public List<InboundHeaderResponse> getInboundHeaders(SearchInboundRequest request) {
        return inboundQueryRepository.findInboundHeaders(request);
    }

    /**
     * 입고 상세 목록 조회
     */
    @Transactional(readOnly = true)
    public List<InboundDetailResponse> getInboundDetails(String inboundNo) {
        return inboundQueryRepository.findInboundDetails(inboundNo);
    }
}
