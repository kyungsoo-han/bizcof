package com.bizcof.wms.system.repository.querydsl;

import com.bizcof.wms.system.domain.QCommonCode;
import com.bizcof.wms.system.dto.CommonCodeResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CommonCodeQueryRepository {
    private final JPAQueryFactory queryFactory;
    private static final QCommonCode commonCode = QCommonCode.commonCode;

    /**
     * 그룹코드로 공통코드 목록 조회 (사용중인 것만)
     */
    public List<CommonCodeResponse> findByGroupCode(String groupCode) {
        return queryFactory.select(
                        Projections.fields(
                                CommonCodeResponse.class,
                                commonCode.id,
                                commonCode.groupCode,
                                commonCode.code,
                                commonCode.name,
                                commonCode.engName,
                                commonCode.useYn,
                                commonCode.sortOrder
                        ))
                .from(commonCode)
                .where(
                        commonCode.groupCode.eq(groupCode),
                        commonCode.useYn.eq("Y")
                )
                .orderBy(commonCode.sortOrder.asc())
                .fetch();
    }

    /**
     * 그룹코드로 공통코드 목록 조회 (전체)
     */
    public List<CommonCodeResponse> findAllByGroupCode(String groupCode) {
        return queryFactory.select(
                        Projections.fields(
                                CommonCodeResponse.class,
                                commonCode.id,
                                commonCode.groupCode,
                                commonCode.code,
                                commonCode.name,
                                commonCode.engName,
                                commonCode.description,
                                commonCode.attr1,
                                commonCode.attr2,
                                commonCode.attr3,
                                commonCode.useYn,
                                commonCode.sortOrder
                        ))
                .from(commonCode)
                .where(commonCode.groupCode.eq(groupCode))
                .orderBy(commonCode.sortOrder.asc())
                .fetch();
    }
}
