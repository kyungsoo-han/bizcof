package com.bizcof.wms.allocation.repository;

import com.bizcof.wms.allocation.domain.AllocationHeader;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AllocationHeaderRepository extends JpaRepository<AllocationHeader, String> {

}