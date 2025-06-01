package com.bizcof.wms.master.repository.querydsl;


import com.bizcof.wms.master.dto.response.CustomerModalDto;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.bizcof.wms.master.domain.QCustomer.customer;

@Slf4j
@Repository
@RequiredArgsConstructor
public class CustomerQueryRepository {

    private final JPAQueryFactory queryFactory;

    public List<CustomerModalDto> getModalCustomers(String searchKeyword) {
        return queryFactory.select(Projections.constructor(
                        CustomerModalDto.class,
                        customer.id,
                        customer.code,
                        customer.name))
                .from(customer)
                .where(
                        containsLikeOr(List.of(customer.code, customer.name), searchKeyword)
                )
                .fetch();
    }

    private BooleanExpression containsLikeOr(List<StringPath> paths, String keyword) {
        if (keyword == null || keyword.isBlank() || paths == null || paths.isEmpty()) {
            return null;
        }

        BooleanExpression result = null;
        for (StringPath path : paths) {
            BooleanExpression condition = path.containsIgnoreCase(keyword);
            result = (result == null) ? condition : result.or(condition);
        }
        return result;
    }

}
