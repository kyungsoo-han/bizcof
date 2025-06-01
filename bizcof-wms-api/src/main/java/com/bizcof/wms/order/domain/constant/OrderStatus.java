package com.bizcof.wms.order.domain.constant;

public enum OrderStatus {
    REGISTERED,       // 주문 등록됨
    CONFIRMED,
    IN_PRODUCTION,    // 생산 중
    COMPLETED,        // 생산 완료
    DELIVERED,        // 납품/배송 완료
    CANCELLED         // 주문 취소
}
