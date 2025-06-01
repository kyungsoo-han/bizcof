package com.bizcof.wms.inventory.controller.view;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/view/inventory")
public class InventoryViewController {

    @GetMapping("/list")
    public String list() {
        return "inventory/manage/inventory-list";
    }

}
