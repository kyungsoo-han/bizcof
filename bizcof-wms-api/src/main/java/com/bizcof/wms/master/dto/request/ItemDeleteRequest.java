package com.bizcof.wms.master.dto.request;

import com.bizcof.common.dto.request.BaseRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 삭제 요청 DTO
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper=false)
@AllArgsConstructor(staticName = "of")
public class ItemDeleteRequest extends BaseRequest {
    private List<Long> ids;
}
