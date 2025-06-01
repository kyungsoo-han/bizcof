package com.bizcof.wms.master.controller.view;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/view/master/bom")
public class BomViewController {


    @GetMapping
    public String bomMnagage() {
        return "master/bom/bom-manage";
    }

}
