package com.bizcof.wms.system.controller.api;

import com.bizcof.common.dto.response.BaseResponse;
import com.bizcof.wms.system.dto.CommonCodeResponse;
import com.bizcof.wms.system.service.CommonCodeService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/system/code")
public class CommonCodeApiController {

    private final CommonCodeService commonCodeService ;

    @GetMapping("{groupCode}")
    public BaseResponse<List<CommonCodeResponse>> getInboundTypes(@PathVariable String groupCode) {

        List<CommonCodeResponse> codes= commonCodeService.getCodes(groupCode);
        return BaseResponse.success(codes);
    }

}
