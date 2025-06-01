package com.bizcof.wms.master.controller.api;

import com.bizcof.wms.master.dto.response.CustomerModalDto;
import com.bizcof.wms.master.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/master/customer")
public class CustomerApiController {
    private final CustomerService customerService;

     @GetMapping("/modal")
     public List<CustomerModalDto> getModalCustomers(@RequestParam("searchKeyword") String searchKeyword) {
         List<CustomerModalDto> customers = customerService.getModalCustomers(searchKeyword); // 검색 필터 반영 가능
         return customers;
     }

}
