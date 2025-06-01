package com.bizcof.wms.outbound.repository.querydsl;


import com.bizcof.common.abstracts.QueryDslSupport;
import com.bizcof.wms.outbound.dto.request.search.SearchOutboundRequest;
import com.bizcof.wms.outbound.dto.response.OutboundDetailResponse;
import com.bizcof.wms.outbound.dto.response.OutboundHeaderResponse;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bizcof.wms.outbound.domain.QOutboundDetail.outboundDetail;
import static com.bizcof.wms.outbound.domain.QOutboundHeader.outboundHeader;
import static com.bizcof.wms.master.domain.QCustomer.customer;
import static com.bizcof.wms.master.domain.QItem.item;
import static com.bizcof.wms.system.domain.QCommonCode.commonCode1;

@Slf4j
@Repository
@RequiredArgsConstructor
public class OutboundQueryRepository extends QueryDslSupport {
    private final JPAQueryFactory queryFactory;

    public List<OutboundHeaderResponse> findOutboundHeaders(SearchOutboundRequest request) {
        BooleanBuilder builder = and(
                like(outboundHeader.outboundNo, request.getSearchOutboundNo()),
                like(customer.name, request.getSearchCustomerName()),
                like(customer.code, request.getSearchCustomerCode()),
                between(outboundHeader.outboundDate, request.getOutboundStartDate(), request.getOutboundEndDate())

        );

        return queryFactory
                .select(
                        Projections.fields(
                                OutboundHeaderResponse.class,
                                outboundHeader.outboundNo,
                                outboundHeader.outboundDate,
                                outboundHeader.customerId,
                                customer.code.as("customerCode"),
                                customer.name.as("customerName"),
                                outboundHeader.outboundType,
                                commonCode1.commonName.as("outboundTypeName"),
                                outboundHeader.memo
                        ))
                .from(outboundHeader)
                .leftJoin(customer)
                .on(outboundHeader.customerId.eq(customer.id))
                .leftJoin(commonCode1)
                .on(outboundHeader.outboundType.eq(commonCode1.commonCode).and(commonCode1.groupCode.eq("OUTBOUND_TYPE")))
                .where(builder)
                .orderBy(outboundHeader.outboundNo.asc().nullsLast())
                .fetch();
    }


    public List<OutboundDetailResponse> findOutboundDetails(String outboundNo) {
        return queryFactory
                .select(
                        Projections.fields(
                                OutboundDetailResponse.class,
                                outboundDetail.seqNo,
                                outboundDetail.itemId,
                                item.code.as("itemCode"),
                                item.name.as("itemName"),
                                item.boxPerSkuQty,
                                item.pltPerSkuQty,
                                outboundDetail.boxQty,
                                outboundDetail.pltQty,
                                outboundDetail.outboundQty,
                                outboundDetail.locationCode,
                                outboundDetail.expireDate,
                                outboundDetail.makeDate,
                                outboundDetail.makeNo,
                                outboundDetail.memo
                        ))
                .from(outboundDetail)
                .leftJoin(item)
                .on(outboundDetail.itemId.eq(item.id))
                .where(eq(outboundDetail.outboundNo, outboundNo))
                .orderBy(outboundDetail.seqNo.asc().nullsLast())
                .fetch();
    }

    protected BooleanBuilder between(StringExpression path, String from, String to) {
        if (StringUtils.hasText(from) && StringUtils.hasText(to)) {
            return new BooleanBuilder(path.goe(from).and(path.loe(to)));
        } else if (StringUtils.hasText(from)) {
            return new BooleanBuilder(path.goe(from));
        } else if (StringUtils.hasText(to)) {
            return new BooleanBuilder(path.loe(to));
        }
        return null;
    }
}
