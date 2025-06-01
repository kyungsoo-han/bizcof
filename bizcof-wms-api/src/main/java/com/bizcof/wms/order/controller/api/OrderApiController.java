package com.bizcof.wms.order.controller.api;

import com.bizcof.common.dto.response.BaseResponse;
import com.bizcof.wms.order.dto.request.OrderConfirmRequest;
import com.bizcof.wms.order.dto.request.OrderCreateRequest;
import com.bizcof.wms.order.dto.request.OrderUpdateRequest;
import com.bizcof.wms.order.dto.request.search.SearchOrderRequest;
import com.bizcof.wms.order.dto.response.OrderDetailResponse;
import com.bizcof.wms.order.dto.response.OrderHeaderResponse;
import com.bizcof.wms.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "주문 API", description = "주문 등록/수정/삭제 및 조회")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
public class OrderApiController {

    private final OrderService orderService;

    @Operation(summary = "주문 등록")
    @PostMapping
    public BaseResponse createOrder(@RequestBody OrderCreateRequest request) {
        orderService.createOrder(request);
        return BaseResponse.success();
    }

    @Operation(summary = "주문 확정")
    @PostMapping("/confirm")
    public BaseResponse confirmOrder(@RequestBody OrderConfirmRequest request) {
        orderService.confirmOrder(request);
        return BaseResponse.success();
    }

    @Operation(summary = "주문 수정")
    @PutMapping
    public BaseResponse updateOrder(@RequestBody OrderUpdateRequest request) {
        orderService.updateOrder(request);
        return BaseResponse.success();
    }

    @Operation(summary = "주문 삭제")
    @DeleteMapping("/{orderNo}")
    public BaseResponse deleteOrder(@PathVariable String orderNo) {
        orderService.deleteOrder(orderNo);
        return BaseResponse.success();
    }

    @Operation(summary = "주문 리스트 조회")
    @GetMapping("/header")
    public BaseResponse<List<OrderHeaderResponse>> getOrderHeaders(SearchOrderRequest request) {
        return BaseResponse.success(orderService.getOrderHeaders(request));
    }

    @Operation(summary = "주문 단건 상세 조회")
    @GetMapping("/header/{orderNo}")
    public BaseResponse<OrderHeaderResponse> getOrderHeader(@PathVariable String orderNo) {
        return BaseResponse.success(orderService.getOrderHeader(orderNo));
    }

    @Operation(summary = "주문 상세 품목 조회")
    @GetMapping("/detail/{orderNo}")
    public BaseResponse<List<OrderDetailResponse>> getOrderDetails(@PathVariable String orderNo) {
        return BaseResponse.success(orderService.getOrderDetails(orderNo));
    }
}