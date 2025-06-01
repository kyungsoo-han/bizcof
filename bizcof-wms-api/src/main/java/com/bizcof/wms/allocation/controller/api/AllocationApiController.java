package com.bizcof.wms.allocation.controller.api;

import com.bizcof.wms.allocation.dto.request.AllocationCreateRequest;
import com.bizcof.wms.allocation.service.AllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/allocation")
@RequiredArgsConstructor
public class AllocationApiController {

    private final AllocationService allocationService;

    // ✅ 할당 등록
    @PostMapping
    public ResponseEntity<Void> createAllocation(@RequestBody AllocationCreateRequest request) {
        allocationService.createAllocation(request);
        return ResponseEntity.ok().build();
    }

    // ✅ 개별 품목 삭제
    @DeleteMapping("/{allocationNo}/items/{seqNo}")
    public ResponseEntity<Void> deleteAllocationItem(@PathVariable String allocationNo, @PathVariable Integer seqNo) {
        allocationService.deleteAllocationItem(allocationNo, seqNo);
        return ResponseEntity.noContent().build();
    }
}