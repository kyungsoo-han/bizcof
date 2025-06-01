package com.bizcof.wms.system.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/view/system/menu")
public class MenuViewController {


    @GetMapping
    public String itemListPage() {
        return "system/menu/menu-manage";
    }

}
