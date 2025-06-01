package com.bizcof.wms.inbound.repository;

import com.bizcof.wms.inbound.domain.InboundHeader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface InboundHeaderRepository extends
        JpaRepository<InboundHeader, String>,
        QuerydslPredicateExecutor<InboundHeader> {
}
