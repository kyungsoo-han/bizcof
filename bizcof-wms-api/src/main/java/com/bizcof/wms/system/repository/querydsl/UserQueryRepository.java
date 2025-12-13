package com.bizcof.wms.system.repository.querydsl;


import com.bizcof.common.abstracts.QueryDslSupport;
import com.bizcof.wms.system.dto.UserDto;
import com.bizcof.wms.system.dto.request.SearchUserRequest;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.bizcof.wms.system.domain.QUser.user;

@Slf4j
@Repository
@RequiredArgsConstructor
public class UserQueryRepository extends QueryDslSupport {

    private final JPAQueryFactory queryFactory;

    public List<UserDto> findAllUsers(SearchUserRequest request) {

        BooleanBuilder builder = new BooleanBuilder();

        if (StringUtils.hasText(request.getUserId())) {
            builder.and(user.loginId.containsIgnoreCase(request.getUserId()));
        }
        if (StringUtils.hasText(request.getUserName())) {
            builder.and(user.name.containsIgnoreCase(request.getUserName()));
        }
        if (StringUtils.hasText(request.getDepartment())) {
            builder.and(user.department.containsIgnoreCase(request.getDepartment()));
        }
        if (StringUtils.hasText(request.getUseYn()) && !"ALL".equals(request.getUseYn())) {
            builder.and(user.useYn.eq(request.getUseYn()));
        }

        return queryFactory
                .select(Projections.constructor(
                        UserDto.class,
                        user.id,
                        user.loginId,
                        user.name,
                        user.email,
                        user.tel,
                        user.department,
                        user.position,
                        user.role,
                        user.useYn,
                        user.createdDt,
                        user.modifiedDt
                ))
                .from(user)
                .where(builder)
                .orderBy(user.id.desc())
                .fetch();
    }

}
