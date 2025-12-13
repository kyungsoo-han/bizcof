package com.bizcof.config;

import com.bizcof.common.dto.response.BaseResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
public class VersionController {

    private final String buildTime = LocalDateTime.now().toString();

    @GetMapping("/version")
    public ResponseEntity<BaseResponse<VersionResponse>> getVersion() {
        return ResponseEntity.ok(BaseResponse.success(new VersionResponse(buildTime)));
    }

    @Getter
    @AllArgsConstructor
    public static class VersionResponse {
        private String buildTime;
    }
}
