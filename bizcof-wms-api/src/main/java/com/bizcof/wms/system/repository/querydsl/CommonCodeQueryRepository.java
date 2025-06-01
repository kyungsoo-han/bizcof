package com.bizcof.wms.system.repository.querydsl;

import com.bizcof.wms.inbound.dto.response.InboundHeaderResponse;
import com.bizcof.wms.system.domain.CommonCode;
import com.bizcof.wms.system.domain.QCommonCode;
import com.bizcof.wms.system.dto.CommonCodeResponse;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.bizcof.wms.inbound.domain.QInboundHeader.inboundHeader;
import static com.bizcof.wms.master.domain.QCustomer.customer;
import static com.bizcof.wms.system.domain.QCommonCode.commonCode1;

@Repository
@RequiredArgsConstructor
public class CommonCodeQueryRepository {
    private final JPAQueryFactory queryFactory;

    public List<CommonCodeResponse> findCodes(String groupCode) {

        return queryFactory.select(
                        Projections.fields(
                                CommonCodeResponse.class,
                                commonCode1.commonCode,
                                commonCode1.commonName
                        ))
                .from(commonCode1)
                .where(
                        commonCode1.groupCode.eq(groupCode),
                        commonCode1.useYn.eq("Y")
                )
                .orderBy(commonCode1.sortOrder.asc())
                .fetch();
    }
}
