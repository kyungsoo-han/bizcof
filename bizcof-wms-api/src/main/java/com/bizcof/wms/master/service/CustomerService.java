package com.bizcof.wms.master.service;

import com.bizcof.wms.master.dto.response.CustomerModalDto;
import com.bizcof.wms.master.repository.querydsl.CustomerQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerQueryRepository customerQueryRepository;

    public List<CustomerModalDto> getModalCustomers(String searchKeyword) { return customerQueryRepository.getModalCustomers(searchKeyword);
    }
}
