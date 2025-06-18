package com.bizcof.wms.master.controller.view;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/view/master/customer")
public class CustomerViewController {

    @GetMapping("/search-modal")
    public String customerSearchModal() {
        return "master/customer/customer-search-modal :: modal"; // `th:fragment="modal"`로 정의된 부분
    }

    @GetMapping("/list")
      public String itemListPage() {
          return "master/customer/customer-list";
      }

}
