package com.bizcof.wms.system.repository;

import com.bizcof.wms.system.domain.CommonCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.Optional;

public interface CommonCodeRepository extends
        JpaRepository<CommonCode, Long>,
        QuerydslPredicateExecutor<CommonCode> {

    List<CommonCode> findByGroupCodeAndUseYnOrderBySortOrder(String groupCode, String useYn);

    List<CommonCode> findByGroupCodeOrderBySortOrder(String groupCode);

    Optional<CommonCode> findByGroupCodeAndCode(String groupCode, String code);

    boolean existsByGroupCodeAndCode(String groupCode, String code);
}
