package com.bizcof.wms.master.controller.api;

import com.bizcof.common.dto.response.BaseResponse;
import com.bizcof.wms.master.dto.request.BomCreateRequest;
import com.bizcof.wms.master.dto.request.BomSaveRequest;
import com.bizcof.wms.master.dto.response.BomResponse;
import com.bizcof.wms.master.dto.response.BomTreeResponse;
import com.bizcof.wms.master.service.BomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "BOM API", description = "BOM 구성 등록/조회/삭제")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bom")
public class BomApiController {

    private final BomService bomService;

    @Operation(
        summary = "BOM 구성 일괄 저장",
        description = "rowState(created/updated/deleted)를 기준으로 BOM을 일괄 저장합니다.",
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "BOM 저장 요청 객체",
            required = true
        )
    )
    @PostMapping("/bulk")
    public BaseResponse saveBomList(@RequestBody BomSaveRequest request) {
        bomService.saveBomList(request);
        return BaseResponse.success();
    }

    @Operation(
        summary = "BOM 전체 트리 전개",
        description = "topItemId를 기준으로 하위 BOM을 계층 구조로 조회합니다."
    )
    @GetMapping("/tree/{topItemId}")
    public BaseResponse<List<BomTreeResponse>> getBomTree(
            @PathVariable(name = "topItemId")
            Long topItemId
    ) {
        return BaseResponse.success(bomService.getBomTree(topItemId));
    }
}