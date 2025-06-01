package com.bizcof.wms.master.domain.constant;

import lombok.Getter;

@Getter
public enum ItemCategory {

    ELECT("001", "전자기기"),
    CLOTH("002", "옷"),
    BOOK("003", "책"),
    FOOD("004", "음식");

    private final String code;
    private final String name;

    ItemCategory(String code, String name) {
        this.code = code;
        this.name = name;
    }

//    public static ItemCategory fromCode(String code) {
//        return Arrays.stream(ItemCategory.values())
//                .filter(c -> c.code.equals(code))
//                .findFirst()
//                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코드입니다. " + code));
//    }
}
