package com.bizcof.common.abstracts;


import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.dsl.*;
import org.springframework.util.StringUtils;

public abstract class QueryDslSupport {

    protected BooleanBuilder nullSafeBuilder(BooleanBuilder... builders) {
        BooleanBuilder result = new BooleanBuilder();
        for (BooleanBuilder b : builders) {
            if (b != null) {
                result.and(b);
            }
        }
        return result;
    }

    protected <T> BooleanBuilder eq(SimpleExpression<T> path, T value) {
        return value != null ? new BooleanBuilder(path.eq(value)) : null;
    }

    protected BooleanBuilder like(StringExpression path, String value) {
        return StringUtils.hasText(value) ? new BooleanBuilder(path.containsIgnoreCase(value)) : null;
    }

    protected BooleanBuilder startsWith(StringExpression path, String value) {
        return StringUtils.hasText(value) ? new BooleanBuilder(path.startsWithIgnoreCase(value)) : null;
    }

    protected BooleanBuilder or(BooleanBuilder... builders) {
        BooleanBuilder result = new BooleanBuilder();
        for (BooleanBuilder b : builders) {
            if (b != null) {
                result.or(b);
            }
        }
        return result;
    }

    protected BooleanBuilder and(BooleanBuilder... builders) {
        return nullSafeBuilder(builders);
    }

    protected <T extends Comparable> BooleanBuilder between(DateTimeExpression<T> path, T from, T to) {
        if (from != null && to != null) {
            return new BooleanBuilder(path.between(from, to));
        } else if (from != null) {
            return new BooleanBuilder(path.goe(from));
        } else if (to != null) {
            return new BooleanBuilder(path.loe(to));
        }
        return null;
    }

}