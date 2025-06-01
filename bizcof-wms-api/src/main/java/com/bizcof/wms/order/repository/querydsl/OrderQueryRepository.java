package com.bizcof.wms.order.repository.querydsl;

import com.bizcof.common.abstracts.QueryDslSupport;
import com.bizcof.wms.order.dto.request.search.SearchOrderRequest;
import com.bizcof.wms.order.dto.response.OrderDetailResponse;
import com.bizcof.wms.order.dto.response.OrderHeaderResponse;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.StringExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bizcof.wms.master.domain.QCustomer.customer;
import static com.bizcof.wms.master.domain.QItem.item;
import static com.bizcof.wms.order.domain.QOrder.order;

@Repository
@RequiredArgsConstructor
public class OrderQueryRepository extends QueryDslSupport {

    private final JPAQueryFactory queryFactory;

    /**
     * 1. 주문 공통 리스트 (품목 제외)
     */
    public List<OrderHeaderResponse> findOrderHeaders(SearchOrderRequest request) {
        BooleanBuilder builder = and(
                like(order.orderNo, request.getSearchOrderNo()),
                like(order.customerName, request.getSearchCustomerName()),
                between(order.orderDate, request.getOrderStartDate(), request.getOrderEndDate())
        );

        return queryFactory
                .select(Projections.fields(
                        OrderHeaderResponse.class,
                        order.orderNo,
                        order.orderDate,
                        order.customerId,
                        customer.name.as("customerName"),
                        order.customerName.as("customerName2"),
                        order.phoneNbr,
                        order.deliveryDate,
                        order.deliveryAddress,
                        order.dueDate,
                        order.memo,
                        order.customerMemo,
                        order.orderStatus.stringValue().as("orderStatus")
                ))
                .from(order)
                .leftJoin(customer).on(customer.id.eq(order.customerId))
                .where(builder)
                .orderBy(order.orderNo.asc().nullsLast())
                .distinct()
                .fetch();
    }

    /**
     * 2. 주문 공통 단건 조회 (주문번호 기준)
     */
    public OrderHeaderResponse findOrderHeader(String orderNo) {
        return queryFactory
                .select(Projections.fields(
                        OrderHeaderResponse.class,
                        order.orderNo,
                        order.orderDate,
                        order.customerId,
                        order.customerName,
                        order.phoneNbr,
                        order.deliveryDate,
                        order.deliveryAddress,
                        order.dueDate,
                        order.memo,
                        order.customerMemo,
                        order.orderStatus.stringValue().as("orderStatus")
                ))
                .from(order)
                .where(order.orderNo.eq(orderNo))
                .fetchOne();
    }

    /**
     * 3. 주문 상세 품목 조회 (단일 품목 기준)
     */
    public List<OrderDetailResponse> findOrderDetails(String orderNo) {
        return queryFactory
                .select(Projections.fields(
                        OrderDetailResponse.class,
                        order.id.as("orderId"),
                        order.itemId,
                        item.code.as("itemCode"),
                        item.name.as("itemName"),
                        order.orderQty,
                        order.subMemo
                ))
                .from(order)
                .leftJoin(item).on(order.itemId.eq(item.id))
                .where(order.orderNo.eq(orderNo))
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