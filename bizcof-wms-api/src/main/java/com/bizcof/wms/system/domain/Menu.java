package com.bizcof.wms.system.domain;
import com.bizcof.common.domain.BaseEntity;
import com.bizcof.wms.system.dto.MenuDto;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "t_menu")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Menu extends BaseEntity {
     @Id
     @Column(name = "menu_cd", length = 20, nullable = false)
     private String menuCd;

     @Column(name = "menu_nm", length = 100, nullable = false)
     private String menuNm;

     @Column(name = "menu_location", length = 255)
     private String menuLocation;

     @Column(name = "parent_yn", length = 1, nullable = false)
     private String parentYn;

     @Column(name = "parent_cd", length = 20)
     private String parentCd;

     @Column(name = "level", nullable = false)
     private Integer level;

     @Column(name = "icon", length = 100)
     private String icon;

     @Column(name = "sort_order")
     private Integer sortOrder;

     @Column(name = "use_yn", length = 1, nullable = false)
     private String useYn;

   public static Menu of(
             String menuCd,
             String menuNm,
             String menuLocation,
             String parentYn,
             String parentCd,
             Integer level,
             String icon,
             Integer sortOrder,
             String useYn
     ){
         return new Menu(menuCd,
         menuNm,
         menuLocation,
         parentYn,
         parentCd,
         level,
         icon,
         sortOrder,
         useYn);
     }


    public void update(MenuDto dto) {
       this.menuNm = dto.getMenuNm();
       this.menuLocation = dto.getMenuLocation();
       this.parentYn = dto.getParentYn();
       this.parentCd = dto.getParentCd();
       this.level = dto.getLevel();
       this.icon = dto.getIcon();
       this.sortOrder = dto.getSortOrder();
       this.useYn = dto.getUseYn();
    }
}
