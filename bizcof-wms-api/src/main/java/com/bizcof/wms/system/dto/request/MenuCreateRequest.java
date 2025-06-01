package com.bizcof.wms.system.dto.request;

import com.bizcof.wms.system.dto.MenuDto;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper=false)
@Data
public class MenuCreateRequest {

    private String menuCd;
    private String menuNm;
    private String menuLocation;
    private String parentYn;
    private String parentCd;
    private Integer level;
    private String icon;
    private Integer sortOrder;
    private String useYn;

    public MenuDto toDto() {
        return new MenuDto(menuCd, menuNm, menuLocation, parentYn, parentCd, level, icon, sortOrder, useYn);
    }

}
