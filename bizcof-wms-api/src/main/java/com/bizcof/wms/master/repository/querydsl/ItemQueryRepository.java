package com.bizcof.wms.master.repository.querydsl;


import com.bizcof.wms.master.dto.request.search.SearchItemRequest;
import com.bizcof.wms.master.dto.response.ItemListDto;
import com.bizcof.wms.master.dto.response.ItemModalDto;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import static com.bizcof.wms.master.domain.QCustomer.customer;
import static com.bizcof.wms.master.domain.QItem.item;
import java.util.List;

@Slf4j
@Repository
@RequiredArgsConstructor
public class ItemQueryRepository {

    private final JPAQueryFactory queryFactory;

    public List<ItemListDto> findAllItems(SearchItemRequest request) {
        log.info("request:{}", request);
        return queryFactory
                .select(Projections.constructor(
                        ItemListDto.class,
                        item.id,
                        item.code,
                        item.name,
                        item.sname,
                        item.ename,
                        item.type,
                        item.spec,
                        item.inventoryUnitCode,
                        item.skuUnitCode,
                        item.skuPerIuQty,
                        item.boxPerSkuQty,
                        item.pltPerSkuQty,
                        customer.id,
                        customer.code,
                        customer.name,
                        item.price,
                        item.useYn,
                        item.barcode,
                        item.width,
                        item.height,
                        item.depth,
                        item.weight,
                        item.description,
                        item.memo,
                        item.createdDt,
                        item.modifiedDt
                ))
                .from(item)
                .leftJoin(item.customer, customer)
                .where(
                        containsLike(item.code, request.getSearchItemCode()),
                        containsLike(item.name, request.getSearchItemName()),
                        containsLike(item.type, request.getSearchItemType()),
                        containsLike(item.useYn, request.getSearchUseYn()),
                        containsLike(item.barcode, request.getSearchBacode()),
                        containsLike(customer.code, request.getSearchCustomerCode()),
                        containsLike(customer.name, request.getSearchCustomerName())
                )
                .fetch();
    }


    public List<ItemModalDto> findModalItems(String searchKeyword) {
        return queryFactory.select(Projections.constructor(
                        ItemModalDto.class,
                        item.id,
                        item.code,
                        item.name,
                        item.spec,
                        item.skuUnitCode,
                        item.inventoryUnitCode,
                        item.skuPerIuQty,
                        item.boxPerSkuQty,
                        item.pltPerSkuQty))
                .from(item)
                .where(containsLikeOr(List.of(item.code, item.name), searchKeyword))
                .fetch();
    }
    private BooleanExpression containsLike(StringPath path, String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return path.containsIgnoreCase(value);
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
