package com.bizcof.wms.master.service;

import com.bizcof.wms.master.dto.response.ItemDto;
import com.bizcof.wms.master.dto.request.ItemCreateRequest;
import com.bizcof.wms.master.dto.request.ItemDeleteRequest;
import com.bizcof.wms.master.dto.request.ItemUpdateRequest;
import com.bizcof.wms.master.dto.request.search.SearchItemRequest;
import com.bizcof.wms.master.dto.response.ItemListDto;
import com.bizcof.wms.master.dto.response.ItemModalDto;
import com.bizcof.wms.master.repository.ItemRepository;
import com.bizcof.wms.master.repository.querydsl.ItemQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemQueryRepository itemQueryRepository;

    @Transactional
    public Long createItem(ItemCreateRequest  request) {
        return itemRepository.save(request.toDto().toEntity()).getId();
    }

    @Transactional
    public void updateItem(ItemUpdateRequest request) {
        itemRepository.findById(request.getId())
                .ifPresent(item -> item.update(request.toDto())); // 엔티티에 updateFrom 메서드 필요
    }

    @Transactional
    public void deleteItems(ItemDeleteRequest request) {
        itemRepository.deleteAllByIdInBatch(request.getIds());
    }

    @Transactional(readOnly = true)
    public List<ItemListDto> getItemList(SearchItemRequest request) {
        return itemQueryRepository.findAllItems(request);
    }

    @Transactional(readOnly = true)
    public List<ItemModalDto> getModalItems(String searchKeyword) {
        return itemQueryRepository.findModalItems(searchKeyword);
    }

    public ItemDto getItem(Long id) {
       return itemRepository.findById(id)
                            .stream()
                            .map(i-> ItemDto.builder()
                                    .id(i.getId())
                                   .code(i.getCode())
                                   .name(i.getName())
                                   .sname(i.getSname())
                                   .ename(i.getEname())
                                   .type(i.getType())
                                   .spec(i.getSpec())
                                   .inventoryUnitCode(i.getInventoryUnitCode())
                                   .skuUnitCode(i.getSkuUnitCode())
                                   .skuPerIuQty(i.getSkuPerIuQty())
                                   .boxPerSkuQty(i.getBoxPerSkuQty())
                                   .pltPerSkuQty(i.getPltPerSkuQty())
                                   .customerId(i.getCustomerId())
                                   .price(i.getPrice())
                                   .useYn(i.getUseYn())
                                   .barcode(i.getBarcode())
                                   .width(i.getWidth())
                                   .height(i.getHeight())
                                   .depth(i.getDepth())
                                   .weight(i.getWeight()) // ✅ 수정됨
                                   .description(i.getDescription())
                                   .memo(i.getMemo())
                                   .build()).findFirst().orElseThrow(() ->  new RuntimeException());
    }
}
