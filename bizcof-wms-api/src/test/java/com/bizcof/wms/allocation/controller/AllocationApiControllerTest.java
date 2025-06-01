package com.bizcof.wms.allocation.controller;

import com.bizcof.wms.allocation.domain.constant.AllocationType;
import com.bizcof.wms.allocation.dto.request.AllocationCreateRequest;
import com.bizcof.wms.allocation.dto.request.AllocationDetailRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AllocationApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ✅ 할당 생성 테스트
    @Test
    void createAllocation_success() throws Exception {
        AllocationCreateRequest request = new AllocationCreateRequest();
        request.setAllocationDate("2025-05-17");
        request.setAllocationType(AllocationType.OUTBOUND);
        request.setMemo("테스트 할당");

        AllocationDetailRequest detail = new AllocationDetailRequest();
        detail.setItemId(1L);
        detail.setAllocatedQty(new BigDecimal("5.0"));
        detail.setLocationCode("12-33-21-41");
        detail.setLotNo("INB2025051400004-0001");
        detail.setExpireDate("2025-05-28");
        detail.setMakeDate("2025-05-02");
        detail.setMakeNo("aaa");
        detail.setRefType(AllocationType.OUTBOUND.name());
        detail.setRefId(1001L);

        request.setItems(List.of(detail));

        mockMvc.perform(post("/api/allocation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    // ✅ 할당 품목 개별 삭제 테스트
    @Test
    void deleteAllocationItem_success() throws Exception {
        String allocationNo = "ALO202505170001";
        int seqNo = 1;

        mockMvc.perform(delete("/api/allocations/{allocationNo}/items/{seqNo}", allocationNo, seqNo))
                .andExpect(status().isNoContent());
    }
}