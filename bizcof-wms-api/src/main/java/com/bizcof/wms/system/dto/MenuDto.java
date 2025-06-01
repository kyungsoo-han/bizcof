package com.bizcof.wms.system.dto;

import com.bizcof.wms.system.domain.Menu;
import com.querydsl.core.annotations.QueryProjection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MenuDto {
    private String menuCd;
    private String menuNm;
    private String menuLocation;
    private String parentYn;
    private String parentCd;
    private Integer level;
    private String icon;
    private Integer sortOrder;
    private String useYn;

    public Menu toEntity(){
        return Menu.of(menuCd,menuNm,menuLocation,parentYn,parentCd,level,icon,sortOrder,useYn);

    }

    @QueryProjection
    public MenuDto(String menuCd, String menuNm, String menuLocation, String parentYn, String parentCd, Integer level, String icon, Integer sortOrder, String useYn) {
        this.menuCd = menuCd;
        this.menuNm = menuNm;
        this.menuLocation = menuLocation;
        this.parentYn = parentYn;
        this.parentCd = parentCd;
        this.level = level;
        this.icon = icon;
        this.sortOrder = sortOrder;
        this.useYn = useYn;
    }
}
