package com.bizcof.wms.inbound.controller.view;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/view/inbound")
public class InboundViewController {

    @GetMapping("/manage/form-modal")
    public String itemFormModal() {
        return "inbound/manage/inbound-form-modal :: modal"; // `th:fragment="modal"`로 정의된 부분
    }

    @GetMapping("/manage")
    public String inboundTask() {
        return "inbound/manage/inbound-task";
    }

}
