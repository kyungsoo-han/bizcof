package com.bizcof.wms.order.controller.view;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/view/order")
public class OrderViewController {

    @GetMapping("/manage/form-modal")
    public String itemFormModal() {
        return "order/manage/order-form-modal :: modal"; // `th:fragment="modal"`로 정의된 부분
    }

    @GetMapping("/manage")
    public String orderTask() {
        return "order/manage/order-task";
    }

}
