package com.bizcof.wms.order.repository;

import com.bizcof.wms.inbound.domain.InboundHeader;
import com.bizcof.wms.order.domain.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends
        JpaRepository<Order, Long>,
        QuerydslPredicateExecutor<Order> {

    /**
     * 주문 번호로 단건 조회
     */
    Optional<Order> findByOrderNo(String orderNo);


    /**
     * 주문 번호로 List 조회
     */
    List<Order> findAllByOrderNo(String orderNo);

    /**
     * 주문 번호로 삭제
     */
    void deleteByOrderNo(String orderNo);
}
