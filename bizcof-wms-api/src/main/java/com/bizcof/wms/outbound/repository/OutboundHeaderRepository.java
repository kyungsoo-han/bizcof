package com.bizcof.wms.outbound.repository;

import com.bizcof.wms.outbound.domain.OutboundHeader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface OutboundHeaderRepository extends
        JpaRepository<OutboundHeader, String>,
        QuerydslPredicateExecutor<OutboundHeader> {
}
