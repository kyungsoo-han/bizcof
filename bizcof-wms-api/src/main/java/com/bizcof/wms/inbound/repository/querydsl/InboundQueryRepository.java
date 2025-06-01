package com.bizcof.wms.inbound.repository.querydsl;


import com.bizcof.common.abstracts.QueryDslSupport;
import com.bizcof.wms.inbound.dto.request.search.SearchInboundRequest;
import com.bizcof.wms.inbound.dto.response.InboundDetailResponse;
import com.bizcof.wms.inbound.dto.response.InboundHeaderResponse;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bizcof.wms.inbound.domain.QInboundDetail.inboundDetail;
import static com.bizcof.wms.inbound.domain.QInboundHeader.inboundHeader;
import static com.bizcof.wms.master.domain.QCustomer.customer;
import static com.bizcof.wms.master.domain.QItem.item;
import static com.bizcof.wms.system.domain.QCommonCode.commonCode1;

@Slf4j
@Repository
@RequiredArgsConstructor
public class InboundQueryRepository extends QueryDslSupport {
    private final JPAQueryFactory queryFactory;

    public List<InboundHeaderResponse> findInboundHeaders(SearchInboundRequest request) {
        BooleanBuilder builder = and(
                like(inboundHeader.inboundNo, request.getSearchInboundNo()),
                like(customer.name, request.getSearchCustomerName()),
                like(customer.code, request.getSearchCustomerCode()),
                between(inboundHeader.inboundDate, request.getInboundStartDate(), request.getInboundEndDate())

        );

        return queryFactory
                .select(
                        Projections.fields(
                                InboundHeaderResponse.class,
                                inboundHeader.inboundNo,
                                inboundHeader.inboundDate,
                                inboundHeader.customerId,
                                customer.code.as("customerCode"),
                                customer.name.as("customerName"),
                                inboundHeader.inboundType,
                                commonCode1.commonName.as("inboundTypeName"),
                                inboundHeader.memo
                        ))
                .from(inboundHeader)
                .leftJoin(customer)
                .on(inboundHeader.customerId.eq(customer.id))
                .leftJoin(commonCode1)
                .on(inboundHeader.inboundType.eq(commonCode1.commonCode).and(commonCode1.groupCode.eq("INBOUND_TYPE")))
                .where(builder)
                .orderBy(inboundHeader.inboundNo.asc().nullsLast())
                .fetch();
    }


    public List<InboundDetailResponse> findInboundDetails(String inboundNo) {
        return queryFactory
                .select(
                        Projections.fields(
                                InboundDetailResponse.class,
                                inboundDetail.seqNo,
                                inboundDetail.itemId,
                                item.code.as("itemCode"),
                                item.name.as("itemName"),
                                item.boxPerSkuQty,
                                item.pltPerSkuQty,
                                inboundDetail.boxQty,
                                inboundDetail.pltQty,
                                inboundDetail.inboundQty,
                                inboundDetail.locationCode,
                                inboundDetail.expireDate,
                                inboundDetail.makeDate,
                                inboundDetail.makeNo,
                                inboundDetail.memo
                        ))
                .from(inboundDetail)
                .leftJoin(item)
                .on(inboundDetail.itemId.eq(item.id))
                .where(eq(inboundDetail.inboundNo, inboundNo))
                .orderBy(inboundDetail.seqNo.asc().nullsLast())
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
