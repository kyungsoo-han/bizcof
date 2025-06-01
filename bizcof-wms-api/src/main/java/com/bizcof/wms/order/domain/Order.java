package com.bizcof.wms.order.domain;

import com.bizcof.common.domain.BaseEntity;
import com.bizcof.wms.order.domain.constant.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;

@Entity
@Table(name = "t_order", schema = "various")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    @Comment("주문 ID")
    private Long id;

    @Column(name = "order_no", length = 30, nullable = false, unique = true)
    @Comment("주문 번호")
    private String orderNo;

    @Column(name = "order_date", length = 10, nullable = false)
    @Comment("주문 일자")
    private String orderDate;

    @Column(name = "delivery_date", length = 10)
    @Comment("배송 일자")
    private String deliveryDate;

    @Column(name = "due_date", length = 10)
    @Comment("요청 납기일")
    private String dueDate;

    @Column(name = "customer_id")
    @Comment("거래처 ID(회원 주문 시)")
    private Long customerId;

    @Column(name = "customer_name", length = 100, nullable = false)
    @Comment("고객 이름")
    private String customerName;

    @Column(name = "delivery_id")
    @Comment("배송지 ID")
    private Long deliveryId;

    @Column(name = "delivery_address", length = 200)
    @Comment("배송지 주소 (비회원 주문용)")
    private String deliveryAddress;

    @Column(name = "phone_nbr", length = 50)
    @Comment("연락처")
    private String phoneNbr;

    @Column(name = "memo", length = 500)
    @Comment("기타 메모")
    private String memo;

    @Column(name = "customer_memo", length = 500)
    @Comment("고객 요청사항")
    private String customerMemo;

    @Column(name = "item_id", nullable = false)
    @Comment("주문 품목 ID")
    private Long itemId;

    @Column(name = "item_name", length = 100)
    @Comment("품목명 (히스토리용)")
    private String itemName;

    @Column(name = "order_qty", precision = 18, scale = 4, nullable = false)
    @Comment("요청 수량")
    private BigDecimal orderQty;

    @Column(name = "sub_memo", length = 500)
    @Comment("보조 메모")
    private String subMemo;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", length = 20)
    @Comment("주문 상태")
    private OrderStatus orderStatus;

    public void update(String orderDate, String deliveryDate, String dueDate,
                       Long customerId, String customerName,
                       Long deliveryId, String deliveryAddress,
                       String phoneNbr, String memo, String customerMemo,
                       Long itemId, String itemName, BigDecimal orderQty, String subMemo,
                       OrderStatus orderStatus) {

        this.orderDate = orderDate;
        this.deliveryDate = deliveryDate;
        this.dueDate = dueDate;
        this.customerId = customerId;
        this.customerName = customerName;
        this.deliveryId = deliveryId;
        this.deliveryAddress = deliveryAddress;
        this.phoneNbr = phoneNbr;
        this.memo = memo;
        this.customerMemo = customerMemo;
        this.itemId = itemId;
        this.itemName = itemName;
        this.orderQty = orderQty;
        this.subMemo = subMemo;
        this.orderStatus = orderStatus;
    }

    public void updateStatus(OrderStatus orderStatus) {
        this.orderStatus = orderStatus;
    }
}