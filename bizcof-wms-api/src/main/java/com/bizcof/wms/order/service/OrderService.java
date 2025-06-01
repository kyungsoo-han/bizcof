package com.bizcof.wms.order.service;

import com.bizcof.config.AllocationStrategyProperties;
import com.bizcof.wms.inventory.domain.Inventory;
import com.bizcof.wms.inventory.domain.constants.InventoryEventType;
import com.bizcof.wms.inventory.events.InventoryEventPublisher;
import com.bizcof.wms.inventory.message.InventoryEventMessage;
import com.bizcof.wms.inventory.repository.InventoryRepository;
import com.bizcof.wms.inventory.repository.querydsl.InventoryQueryRepository;
import com.bizcof.wms.inventory.strategy.InventorySortStrategyFactory;
import com.bizcof.wms.inventory.strategy.constants.AllocationStrategyType;
import com.bizcof.wms.master.dto.response.BomTreeResponse;
import com.bizcof.wms.order.domain.Order;
import com.bizcof.wms.order.domain.constant.OrderStatus;
import com.bizcof.wms.order.dto.request.OrderConfirmRequest;
import com.bizcof.wms.order.dto.request.OrderCreateRequest;
import com.bizcof.wms.order.dto.request.OrderDetailRequest;
import com.bizcof.wms.order.dto.request.OrderUpdateRequest;
import com.bizcof.wms.order.dto.request.search.SearchOrderRequest;
import com.bizcof.wms.order.dto.response.OrderDetailResponse;
import com.bizcof.wms.order.dto.response.OrderHeaderResponse;
import com.bizcof.wms.order.repository.OrderRepository;
import com.bizcof.wms.order.repository.querydsl.OrderQueryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Service
public class OrderService {

    private final AllocationStrategyProperties allocationStrategyProperties;
    private final OrderRepository orderRepository;
    private final InventoryQueryRepository inventoryRepository;
    private final OrderQueryRepository orderQueryRepository;
    private final OrderNumberGenerator orderNumberGenerator;
    private final InventoryEventPublisher inventoryEventPublisher;

    /**
     * 주문 등록
     */
    @Transactional
    public void createOrder(OrderCreateRequest request) {
        String orderNo = orderNumberGenerator.generateOrderNo();
        for (OrderDetailRequest item : request.getItems()) {
            Order order = Order.builder()
                    .orderNo(orderNo) // 주문번호 채번 로직 필요
                    .orderDate(request.getOrderDate())
                    .deliveryDate(request.getDeliveryDate())
                    .dueDate(request.getDueDate())
                    .customerId(request.getCustomerId())
                    .customerName(request.getCustomerName())
                    .deliveryId(request.getDeliveryId())
                    .deliveryAddress(request.getDeliveryAddress())
                    .phoneNbr(request.getPhoneNbr())
                    .memo(request.getMemo())
                    .customerMemo(request.getCustomerMemo())

                    .itemId(item.getItemId())
                    .itemName(item.getItemName())
                    .orderQty(item.getOrderQty())
                    .subMemo(item.getSubMemo())
                    .orderStatus(OrderStatus.REGISTERED)

                    .build();

            orderRepository.save(order);
        }
    }
    /**
     * 주문 수정
     */
    @Transactional
    public void updateOrder(OrderUpdateRequest request) {
        String orderNo = request.getOrderNo();

        // 1. 기존 주문 전체 조회
        List<Order> existingOrders = orderRepository.findAllByOrderNo(orderNo);
        if (existingOrders.isEmpty()) {
            throw new EntityNotFoundException("주문번호 없음: " + orderNo);
        }

        // 2. 기존 주문을 seqNo 기준으로 맵핑 (엔티티에 seqNo가 없으면 index로 처리 가능)
        int currentMaxId = existingOrders.stream()
                .mapToInt(o -> o.getId().intValue()) // or custom SeqNo if 있음
                .max().orElse(0);

        // 3. 추가 / 삭제 / 수정용 리스트 준비
        List<Order> toInsert = new ArrayList<>();
        List<Order> toDelete = new ArrayList<>();

        for (OrderDetailRequest item : request.getItems()) {
            // 삭제 플래그 확인
            if ("Y".equalsIgnoreCase(item.getIsDeleted())) {
                existingOrders.stream()
                    .filter(o -> o.getItemId().equals(item.getItemId())) // 필요시 itemName, orderQty 등도 비교
                    .findFirst()
                    .ifPresent(toDelete::add);
                continue;
            }

            // 수정 대상 찾기
            Order matched = existingOrders.stream()
                    .filter(o -> o.getItemId().equals(item.getItemId()))
                    .findFirst()
                    .orElse(null);

            if (matched != null) {
                // 기존 row 수정
                matched.update(
                        request.getOrderDate(),
                        request.getDeliveryDate(),
                        request.getDueDate(),
                        request.getCustomerId(),
                        request.getCustomerName(),
                        request.getDeliveryId(),
                        request.getDeliveryAddress(),
                        request.getPhoneNbr(),
                        request.getMemo(),
                        request.getCustomerMemo(),
                        item.getItemId(),
                        item.getItemName(),
                        item.getOrderQty(),
                        item.getSubMemo(),
                        OrderStatus.REGISTERED // or request.getOrderStatus()
                );
            } else {
                // 신규 row 추가
                Order newOrder = Order.builder()
                        .orderNo(orderNo)
                        .orderDate(request.getOrderDate())
                        .deliveryDate(request.getDeliveryDate())
                        .dueDate(request.getDueDate())
                        .customerId(request.getCustomerId())
                        .customerName(request.getCustomerName())
                        .deliveryId(request.getDeliveryId())
                        .deliveryAddress(request.getDeliveryAddress())
                        .phoneNbr(request.getPhoneNbr())
                        .memo(request.getMemo())
                        .customerMemo(request.getCustomerMemo())

                        .itemId(item.getItemId())
                        .itemName(item.getItemName())
                        .orderQty(item.getOrderQty())
                        .subMemo(item.getSubMemo())
                        .orderStatus(OrderStatus.REGISTERED)

                        .build();
                toInsert.add(newOrder);
            }
        }

        // 4. 신규 항목 저장
        if (!toInsert.isEmpty()) {
            orderRepository.saveAll(toInsert);
        }

        // 5. 삭제 항목 처리
        if (!toDelete.isEmpty()) {
            orderRepository.deleteAll(toDelete);
        }
    }

    /**
     * 주문 삭제
     */
    @Transactional
    public void deleteOrder(String orderNo) {
        orderRepository.deleteByOrderNo(orderNo);
    }

    /**
     * 주문 리스트 조회 (헤더)
     */
    @Transactional(readOnly = true)
    public List<OrderHeaderResponse> getOrderHeaders(SearchOrderRequest request) {
        return orderQueryRepository.findOrderHeaders(request);
    }

    /**
     * 주문 단건 조회 (상세 헤더)
     */
    @Transactional(readOnly = true)
    public OrderHeaderResponse getOrderHeader(String orderNo) {
        return orderQueryRepository.findOrderHeader(orderNo);
    }

    /**
     * 주문 상세 정보 조회 (품목 정보)
     */
    @Transactional(readOnly = true)
    public List<OrderDetailResponse> getOrderDetails(String orderNo) {
        return orderQueryRepository.findOrderDetails(orderNo);
    }

    /**
     * 주문 확정(가용재고 차감)
     * @param request
     */
    @Transactional
    public void confirmOrder(OrderConfirmRequest request) {
        List<Order> orders = orderRepository.findAllByOrderNo(request.getOrderNo());
        if (orders.isEmpty()) throw new IllegalArgumentException("해당 주문이 존재하지 않습니다.");

        AllocationStrategyType strategyType = allocationStrategyProperties.getStrategy();

        for (Order order : orders) {
            List<Inventory> candidates = inventoryRepository.findAvailableInventories(order.getItemId());

            // 전략 기반 정렬 적용
            List<Inventory> sorted = InventorySortStrategyFactory.sort(strategyType, candidates);

            BigDecimal remainingQty = order.getOrderQty();

            for (Inventory inv : sorted) {
                if (remainingQty.compareTo(BigDecimal.ZERO) <= 0) break;

                BigDecimal availableQty = inv.getTotalQty().subtract(inv.getAllocatedQty());
                if (availableQty.compareTo(BigDecimal.ZERO) <= 0) continue;

                BigDecimal allocQty = remainingQty.min(availableQty);
                remainingQty = remainingQty.subtract(allocQty);

                InventoryEventMessage message = InventoryEventMessage.builder()
                        .eventType(InventoryEventType.ALLOCATE)
                        .itemId(order.getItemId())
                        .locationCode(inv.getLocationCode())
                        .lotNo(inv.getLotNo())
                        .makeDate(inv.getMakeDate())
                        .expireDate(inv.getExpireDate())
                        .makeNo(inv.getMakeNo())
                        .changeQty(allocQty)
                        .inventoryStatus(inv.getInventoryStatus())
                        .refType("ORDER")
                        .refNo(order.getOrderNo())
                        .refSeq(0) // 상세 순번이 없으면 0
                        .actor("system")
                        .build();

                inventoryEventPublisher.publishInventoryEvent(message);
            }

            if (remainingQty.compareTo(BigDecimal.ZERO) > 0) {
                throw new IllegalStateException("가용 재고 부족으로 주문 [" + order.getOrderNo() + "]의 할당에 실패했습니다.");
            }

            order.updateStatus(OrderStatus.CONFIRMED); // 주문 상태 변경
        }
    }
}