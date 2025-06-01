package com.bizcof.wms.master.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity(name = "t_customer")
@ToString(callSuper = true)
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private String name;

    private Customer(String code, String name) {
         this.code = code;
         this.name = name;
     }

    public static Customer of(String code, String name) {
        return new Customer(code, name);
    }

}
