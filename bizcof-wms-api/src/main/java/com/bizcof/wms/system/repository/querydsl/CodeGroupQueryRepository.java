package com.bizcof.wms.system.repository.querydsl;

import com.bizcof.wms.system.dto.CodeGroupResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.bizcof.wms.system.domain.QCodeGroup.codeGroup;

@Repository
@RequiredArgsConstructor
public class CodeGroupQueryRepository {
    private final JPAQueryFactory queryFactory;

    /**
     * 코드 그룹 목록 조회 (사용중인 것만)
     */
    public List<CodeGroupResponse> findAllActive() {
        return queryFactory.select(
                        Projections.fields(
                                CodeGroupResponse.class,
                                codeGroup.id,
                                codeGroup.groupCode,
                                codeGroup.name,
                                codeGroup.description,
                                codeGroup.useYn,
                                codeGroup.sortOrder
                        ))
                .from(codeGroup)
                .where(codeGroup.useYn.eq("Y"))
                .orderBy(codeGroup.sortOrder.asc())
                .fetch();
    }

    /**
     * 코드 그룹 목록 조회 (전체)
     */
    public List<CodeGroupResponse> findAll() {
        return queryFactory.select(
                        Projections.fields(
                                CodeGroupResponse.class,
                                codeGroup.id,
                                codeGroup.groupCode,
                                codeGroup.name,
                                codeGroup.description,
                                codeGroup.useYn,
                                codeGroup.sortOrder
                        ))
                .from(codeGroup)
                .orderBy(codeGroup.sortOrder.asc())
                .fetch();
    }
}
