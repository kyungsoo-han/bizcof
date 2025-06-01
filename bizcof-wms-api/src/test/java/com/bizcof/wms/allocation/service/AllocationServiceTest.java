package com.bizcof.wms.allocation.service;

import com.bizcof.wms.allocation.domain.AllocationDetail;
import com.bizcof.wms.allocation.domain.AllocationDetailId;
import com.bizcof.wms.allocation.domain.AllocationHeader;
import com.bizcof.wms.allocation.domain.constant.AllocationType;
import com.bizcof.wms.allocation.dto.request.AllocationCreateRequest;
import com.bizcof.wms.allocation.dto.request.AllocationDetailRequest;
import com.bizcof.wms.allocation.repository.AllocationDetailRepository;
import com.bizcof.wms.allocation.repository.AllocationHeaderRepository;
import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "spring.profiles.active=local")
@TestPropertySource(properties = {"spring.config.location=classpath:application.yml"})
class AllocationServiceTest {

    @DynamicPropertySource
    static void registerKafka(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", () -> "localhost:9092");
    }


    @Autowired
    private AllocationService allocationService;

    @Autowired
    private AllocationHeaderRepository headerRepository;

    @Autowired
    private AllocationDetailRepository detailRepository;

    @Autowired
    private InventoryRepository inventoryRepository;


    private AllocationCreateRequest testRequest;

    @BeforeEach
    void setUp() {
        // 공통 테스트 데이터 구성
        AllocationDetailRequest detail = new AllocationDetailRequest();
        detail.setItemId(2L);
        detail.setAllocatedQty(new BigDecimal("5.0"));
        detail.setLocationCode("12-33-21-41");
        detail.setLotNo("INB2025051400004-0001");
        detail.setMakeDate("2025-05-02");
        detail.setExpireDate("2025-05-28");
        detail.setMakeNo("aaa");
        detail.setRefId(1001L);
        detail.setRefType("OUTBOUND");

        AllocationCreateRequest request = new AllocationCreateRequest();
        request.setAllocationDate("2025-05-17");
        request.setAllocationType(AllocationType.OUTBOUND);
        request.setMemo("테스트 메모");
        request.setItems(List.of(detail));

        this.testRequest = request;
    }

    @Test
    @DisplayName("할당 생성 성공")
    void createAllocation_success() throws InterruptedException {
        // when
        allocationService.createAllocation(testRequest);

        // then
        List<AllocationHeader> headers = headerRepository.findAll();
        assertThat(headers).isNotEmpty();

        AllocationHeader latestHeader = headers.get(headers.size() - 1);
        List<AllocationDetail> details = detailRepository.findByAllocationNo(latestHeader.getAllocationNo());

        // wait for Kafka consumer to consume and apply
         Thread.sleep(3000); // Awaitility 권장

        assertThat(details).hasSize(1);
        assertThat(details.get(0).getItemId()).isEqualTo(2L);
    }

    @Test
    @DisplayName("할당 상세 항목 개별 삭제 성공")
    void deleteAllocationItem_success() {
        // given
        allocationService.createAllocation(testRequest);
        AllocationHeader header = headerRepository.findAll().get(0);
        AllocationDetail detail = detailRepository.findByAllocationNo(header.getAllocationNo()).get(0);
        AllocationDetailId id = new AllocationDetailId(header.getAllocationNo(), detail.getSeqNo());

        assertThat(detailRepository.findById(id)).isPresent();

        // when
        allocationService.deleteAllocationItem(id.getAllocationNo(), id.getSeqNo());

        // then
        assertThat(detailRepository.findById(id)).isNotPresent();
    }
}