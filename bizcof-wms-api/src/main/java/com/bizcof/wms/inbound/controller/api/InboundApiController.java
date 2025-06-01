package com.bizcof.wms.inbound.controller.api;

import com.bizcof.common.dto.response.BaseResponse;
import com.bizcof.wms.inbound.dto.request.InboundCreateRequest;
import com.bizcof.wms.inbound.dto.request.InboundUpdateRequest;
import com.bizcof.wms.inbound.dto.request.search.SearchInboundRequest;
import com.bizcof.wms.inbound.dto.response.InboundDetailResponse;
import com.bizcof.wms.inbound.dto.response.InboundHeaderResponse;
import com.bizcof.wms.inbound.service.InboundService;
import com.bizcof.wms.master.dto.request.ItemCreateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inbound")
public class InboundApiController {

    private final InboundService inboundService;

    @PostMapping
    public BaseResponse createInbound(@RequestBody InboundCreateRequest request) {
        inboundService.createInbound(request);
        return BaseResponse.success();
    }

    @PutMapping
    public BaseResponse updateInbound(@RequestBody InboundUpdateRequest request) {
        inboundService.updateInbound(request);
        return BaseResponse.success();
    }

    @DeleteMapping("/{inboundNo}")
    public BaseResponse deleteInbound(@PathVariable String inboundNo) {
        inboundService.deleteInbound(inboundNo);
        return BaseResponse.success();
    }


    @GetMapping("/header")
    public BaseResponse<List<InboundHeaderResponse>> getInboundHeaders(SearchInboundRequest request) {
        System.out.println("request = " + request);
        return BaseResponse.success(inboundService.getInboundHeaders(request));
    }

    @GetMapping("/detail/{inboundNo}")
    public BaseResponse<List<InboundDetailResponse>> getInboundDetails(@PathVariable String inboundNo) {
        System.out.println("inboundNo = " + inboundNo);
        return BaseResponse.success(inboundService.getInboundDetails(inboundNo));
    }
}
