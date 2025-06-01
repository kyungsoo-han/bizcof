package com.bizcof.wms.master.controller.view;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Controller
@RequestMapping("/view/master/item")
public class ItemViewController {

    @GetMapping("/search-modal")
    public String itemSearchModal() {
        return "master/item/item-search-modal :: modal"; // `th:fragment="modal"`로 정의된 부분
    }
    
    @GetMapping("/form-modal")
    public String itemFormModal() {
        return "master/item/item-form-modal :: modal"; // `th:fragment="modal"`로 정의된 부분
    }

    @GetMapping("/list")
    public String itemListPage() {
        return "master/item/item-list";
    }

}
