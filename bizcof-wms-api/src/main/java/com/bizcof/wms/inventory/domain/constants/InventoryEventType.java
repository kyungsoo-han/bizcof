package com.bizcof.wms.inventory.domain.constants;


/**
 * ✅ 재고 이벤트 타입 정의
 * - Kafka 기반 재고 변경 이벤트 구분 용도
 * - 각 이벤트는 Redis 및 DB의 재고 수량 필드에 서로 다른 영향을 미침
 */
public enum InventoryEventType {

    /** 입고 처리 (가용재고 증가) → total_qty 증가 */
    INBOUND,

    /** 할당 처리 (가용재고 → 할당재고 이동) → allocated_qty 증가 */
    ALLOCATE,

    /** 할당 취소 (할당재고 → 가용재고 복원) → allocated_qty 감소 */
    ROLLBACK_ALLOCATE,

    /** 출고 확정 (재고 차감) → total_qty 감소 */
    OUTBOUND,

    /** 재고 이동(입고 측) → total_qty 증가 (새 위치로 이동됨) */
    MOVE_IN,

    /** 재고 이동(출고 측) → total_qty 감소 (기존 위치에서 빠짐) */
    MOVE_OUT,

    /** 재고 조정 (+) → total_qty 수동 증가 (조사 결과 반영) */
    ADJUST_PLUS,

    /** 재고 조정 (-) → total_qty 수동 감소 (조사 결과 반영) */
    ADJUST_MINUS,

    /** 출고 취소 (OUTBOUND 롤백) → total_qty 증가 */
    ROLLBACK_IN,

    /** 입고 취소 (INBOUND 롤백) → total_qty 감소 */
    ROLLBACK_OUT
}