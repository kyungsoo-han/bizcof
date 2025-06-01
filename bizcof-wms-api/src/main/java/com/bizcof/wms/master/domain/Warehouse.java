package com.bizcof.wms.master.domain;

import com.bizcof.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
public class Warehouse extends BaseEntity {

    @Column(name = "warehouse_id")
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String location;

    
    
    
}
