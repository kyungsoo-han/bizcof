package com.bizcof.wms.system.controller.api;

import com.bizcof.common.dto.response.BaseResponse;
import com.bizcof.wms.system.dto.MenuDto;
import com.bizcof.wms.system.dto.request.MenuCreateRequest;
import com.bizcof.wms.system.dto.request.MenuUpdateRequest;
import com.bizcof.wms.system.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/system/menu")
public class MenuApiController {
    private final MenuService menuService;

    @PostMapping
    public BaseResponse createMenu(@RequestBody MenuCreateRequest request) {
        menuService.createMenu(request.toDto());

        return BaseResponse.success();
    }
    @PutMapping
    public BaseResponse updateMenu(@RequestBody MenuUpdateRequest request) {
        menuService.updateMenu(request);
        return BaseResponse.success();
    }

    @GetMapping("/list")
    public BaseResponse<List<MenuDto>> getMenuList() {
        return BaseResponse.success(menuService.getMnueList());
    }

}
