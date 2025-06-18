package com.bizcof.wms.outbound.controller.view;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/view/outbound")
public class OutboundViewController {


    @GetMapping("/manage")
    public String outboundTask() {
        return "outbound/manage/outbound-task";
    }

}
