package com.bizcof.wms.system.repository.querydsl;


import com.bizcof.common.abstracts.QueryDslSupport;
import com.bizcof.wms.system.domain.QMenu;
import com.bizcof.wms.system.dto.MenuDto;
import com.bizcof.wms.system.dto.QMenuDto;
import com.bizcof.wms.system.dto.UserDto;
import com.bizcof.wms.system.dto.request.SearchUserRequest;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.List;

import static com.bizcof.wms.system.domain.QMenu.menu;
import static com.bizcof.wms.system.domain.QUser.user;

@Slf4j
@Repository
@RequiredArgsConstructor
public class MenuQueryRepository extends QueryDslSupport {
    private final JPAQueryFactory queryFactory;

    public List<MenuDto> findAllOrderBySortOrder() {
        return queryFactory
                .select(
                        new QMenuDto(
                                menu.menuCd,
                                menu.menuNm,
                                menu.menuLocation,
                                menu.parentYn,
                                menu.parentCd,
                                menu.level,
                                menu.icon,
                                menu.sortOrder,
                                menu.useYn
                        )
                )
                .from(menu)
                .orderBy(menu.sortOrder.asc().nullsLast()) // ✅ sortOrder 기준 정렬
                .fetch();
    }

}
