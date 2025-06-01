package com.bizcof.wms.system.repository;

import com.bizcof.wms.system.domain.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

public interface MenuRepository extends
        JpaRepository<Menu,String>,
        QuerydslPredicateExecutor<Menu> {

}
