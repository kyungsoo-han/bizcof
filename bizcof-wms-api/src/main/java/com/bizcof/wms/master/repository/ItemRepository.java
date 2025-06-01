package com.bizcof.wms.master.repository;

import com.bizcof.wms.master.domain.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ItemRepository extends
        JpaRepository<Item, Long>,
        QuerydslPredicateExecutor<Item> {

    @Query("SELECT i.name FROM Item i WHERE i.id = :id")
    Optional<String> findNameById(@Param("id") Long id);


}