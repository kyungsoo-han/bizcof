package com.bizcof.wms.allocation.repository;


import com.bizcof.wms.allocation.domain.AllocationDetail;
import com.bizcof.wms.allocation.domain.AllocationDetailId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AllocationDetailRepository extends JpaRepository<AllocationDetail, AllocationDetailId> {

    /**
     * ✅ 특정 할당번호에 대한 모든 상세 항목 조회
     */
    List<AllocationDetail> findByAllocationNo(String allocationNo);
}