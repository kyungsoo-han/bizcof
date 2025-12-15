package com.bizcof.wms.system.repository;

import com.bizcof.wms.system.domain.CodeGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.Optional;

public interface CodeGroupRepository extends
        JpaRepository<CodeGroup, Long>,
        QuerydslPredicateExecutor<CodeGroup> {

    Optional<CodeGroup> findByGroupCode(String groupCode);

    List<CodeGroup> findByUseYnOrderBySortOrder(String useYn);

    boolean existsByGroupCode(String groupCode);
}
