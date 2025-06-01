package com.bizcof.wms.master.controller.api;

import com.bizcof.common.dto.response.BaseResponse;
import com.bizcof.wms.master.dto.response.ItemDto;
import com.bizcof.wms.master.dto.request.ItemCreateRequest;
import com.bizcof.wms.master.dto.request.ItemUpdateRequest;
import com.bizcof.wms.master.dto.request.search.SearchItemRequest;
import com.bizcof.wms.master.dto.response.ItemModalDto;
import com.bizcof.wms.master.dto.response.ItemListDto;
import com.bizcof.wms.master.service.ItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/master/item")
public class ItemApiController {
    private final ItemService itemService;

    @GetMapping("/modal")
      public List<ItemModalDto> getModalItems(@RequestParam("searchKeyword") String searchKeyword) {
          List<ItemModalDto> items = itemService.getModalItems(searchKeyword); // 검색 필터 반영 가능
          return items;
      }

      
    @GetMapping("/{id}")
    public BaseResponse<ItemDto> getItem(@PathVariable Long id){
        return BaseResponse.success(itemService.getItem(id));
    }

     @GetMapping("/list")
     public BaseResponse<List<ItemListDto>> getItemList(SearchItemRequest request) {
         List<ItemListDto> itemList = itemService.getItemList(request); // 검색 필터 반영 가능
         return BaseResponse.success(itemList);
     }

     @PostMapping
     public BaseResponse<String> createItem(@RequestBody ItemCreateRequest itemRequest) {
         itemService.createItem(itemRequest);
         return BaseResponse.success(itemRequest.getCode());
     }

     @PutMapping
     public BaseResponse<ItemUpdateRequest> updateItem(@RequestBody ItemUpdateRequest itemRequest) {
         itemService.updateItem(itemRequest);
         return BaseResponse.success(itemRequest);
     }
}
