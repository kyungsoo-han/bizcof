package com.bizcof.wms.master.repository.querydsl;


import com.bizcof.wms.master.domain.Bom;
import com.bizcof.wms.master.domain.QBom;
import com.bizcof.wms.master.dto.request.search.SearchItemRequest;
import com.bizcof.wms.master.dto.response.BomTreeResponse;
import com.bizcof.wms.master.dto.response.ItemListDto;
import com.bizcof.wms.master.dto.response.ItemModalDto;
import com.bizcof.wms.master.repository.ItemRepository;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.bizcof.wms.master.domain.QCustomer.customer;
import static com.bizcof.wms.master.domain.QItem.item;

@Slf4j
@Repository
@RequiredArgsConstructor
public class BomQueryRepository {

    private final JPAQueryFactory queryFactory;
    private final QBom qBom = QBom.bom;


    /**
     * 특정 상위 품목의 하위 BOM 목록 조회
     */
    public List<Bom> findChildren(Long parentItemId) {
        return queryFactory
                .selectFrom(qBom)
                .where(qBom.parentItemId.eq(parentItemId))
                .orderBy(qBom.sortOrder.asc().nullsLast())
                .fetch();
    }
    public List<Bom> findByTopItemAndChildItemId(Long topItemId, Long childItemId) {
        return queryFactory
                .selectFrom(qBom)
                .where(
                    qBom.topItemId.eq(topItemId),
                    qBom.childItemId.eq(childItemId)
                )
                .fetch();
    }
    public List<Bom> findChildrenByTopAndParentItemId(Long topItemId, Long parentItemId) {
        return queryFactory
                .selectFrom(qBom)
                .where(
                    qBom.topItemId.eq(topItemId),
                    qBom.parentItemId.eq(parentItemId)
                )
                .orderBy(qBom.sortOrder.asc().nullsLast())
                .fetch();
    }
    public List<Bom> findParentLinks(Long childItemId) {
        return queryFactory
            .selectFrom(qBom)
            .where(qBom.childItemId.eq(childItemId))
            .fetch();
    }
    public List<Bom> findChildrenByParentBomId(Long parentBomId) {
        return queryFactory
                .selectFrom(qBom)
                .where(parentBomIdEq(parentBomId))
                .orderBy(qBom.sortOrder.asc().nullsLast())
                .fetch();
    }

    private BooleanExpression parentBomIdEq(Long parentBomId) {
        return parentBomId == null
                ? qBom.parentBomId.isNull()
                : qBom.parentBomId.eq(parentBomId);
    }
}
