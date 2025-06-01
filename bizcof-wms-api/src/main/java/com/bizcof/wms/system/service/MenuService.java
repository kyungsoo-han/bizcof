package com.bizcof.wms.system.service;

import com.bizcof.wms.system.domain.Menu;
import com.bizcof.wms.system.dto.MenuDto;
import com.bizcof.wms.system.dto.request.MenuUpdateRequest;
import com.bizcof.wms.system.repository.MenuRepository;
import com.bizcof.wms.system.repository.querydsl.MenuQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Transactional
@RequiredArgsConstructor
@Service
public class MenuService {

    private final MenuRepository menuRepository;
    private final MenuQueryRepository menuQueryRepository;

    public void createMenu(MenuDto dto){
        menuRepository.save(dto.toEntity());
    }

    public void updateMenu(MenuUpdateRequest request)
    {
        menuRepository.findById(request.getMenuCd()).ifPresent(o -> o.update(request.toDto()));
    }
//
//    @Transactional(readOnly = true)
//    public List<MenuDto> getMnueList() {
//        return menuRepository.findAll()
//                .stream()
//                .map(o -> new MenuDto(o.getMenuCd(), o.getMenuNm(), o.getMenuLocation(), o.getParentYn(), o.getParentCd(), o.getLevel(), o.getIcon(),
//                                        o.getSortOrder(), o.getUseYn()))
//                .sorted(Comparator.comparing(MenuDto::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder())))
//                .toList();
//    }

    @Transactional(readOnly = true)
    public List<MenuDto> getMnueList() {
        return menuQueryRepository.findAllOrderBySortOrder();
    }
}
