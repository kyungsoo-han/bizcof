package com.bizcof.wms.outbound.dto.request;

import com.bizcof.wms.outbound.domain.OutboundDetail;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "출고 상세 요청 DTO")
public class OutboundDetailRequest {
    @Schema(description = "상세 순번 (수정 시 식별용)", example = "1")
    private Integer seqNo;

    @Schema(description = "품목 ID", example = "1001")
    private Long itemId;

    @Schema(description = "팔레트 수량", example = "2.0000")
    private BigDecimal pltQty;

    @Schema(description = "박스 수량", example = "5.0000")
    private BigDecimal boxQty;

    @Schema(description = "출고 수량", example = "100.0000")
    private BigDecimal outboundQty;

    @Schema(description = "로케이션 코드", example = "A01-01-01")
    private String locationCode;

    @Schema(description = "유효 기한", example = "2025-12-31")
    private String expireDate;

    @Schema(description = "제조 일자", example = "2024-12-01")
    private String makeDate;

    @Schema(description = "제조 번호", example = "MFG12345")
    private String makeNo;

    @Schema(description = "LOT 번호", example = "LOT202405")
    private String lotNo;

    @Schema(description = "메모", example = "")
    private String memo;

    @Schema(description = "삭제여부", example = "Y/N")
    private String isDeleted;

    public OutboundDetail toEntity(String outboundNo, int seqNo) {
        return OutboundDetail.builder()
                .outboundNo(outboundNo)
                .seqNo(seqNo)
                .itemId(itemId)
                .pltQty(pltQty)
                .boxQty(boxQty)
                .outboundQty(outboundQty)
                .locationCode(locationCode)
                .expireDate(expireDate)
                .makeDate(makeDate)
                .makeNo(makeNo)
                .lotNo(outboundNo + "-" + String.format("%04d", seqNo))
                .memo(memo)
                .build();
    }
}
