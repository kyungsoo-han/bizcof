package com.bizcof.wms.master.repository;


import com.bizcof.wms.master.domain.Bom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BomRepository extends JpaRepository<Bom, Long> {

    List<Bom> findByParentItemId(Long parentItemId);

    boolean existsByParentItemIdAndChildItemId(Long parentItemId, Long childItemId);
}