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

import java.util.List;

import static com.bizcof.wms.system.domain.QUser.user;

@Slf4j
@Repository
@RequiredArgsConstructor
public class UserQueryRepository extends QueryDslSupport {

    private final JPAQueryFactory queryFactory;

    public List<UserDto> findAllUsers(SearchUserRequest request) {

        BooleanBuilder builder = and(
                like(user.loginId, request.getSearchLoginId()),
                like(user.name, request.getSearchUserName()),
                like(user.useYn, request.getSearchUseYn())

        );

        return queryFactory
                .select(Projections.constructor(
                        UserDto.class,
                        user.id,
                        user.loginId,
                        user.name,
                        user.memo,
                        user.useYn,
                        user.createdDt,
                        user.modifiedDt
                ))
                .from(user)
                .where(builder)
                .fetch();
    }

}
