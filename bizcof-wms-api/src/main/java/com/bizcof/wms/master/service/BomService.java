package com.bizcof.wms.master.service;


import com.bizcof.wms.master.domain.Bom;
import com.bizcof.wms.master.domain.Item;
import com.bizcof.wms.master.dto.request.BomCreateRequest;
import com.bizcof.wms.master.dto.request.BomDetailRequest;
import com.bizcof.wms.master.dto.request.BomSaveRequest;
import com.bizcof.wms.master.dto.response.BomResponse;
import com.bizcof.wms.master.dto.response.BomTreeResponse;
import com.bizcof.wms.master.repository.BomRepository;
import com.bizcof.wms.master.repository.ItemRepository;
import com.bizcof.wms.master.repository.querydsl.BomQueryRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static java.util.stream.Collectors.toList;

@RequiredArgsConstructor
@Service
public class BomService {

    private final BomRepository bomRepository;
    private final BomQueryRepository bomQueryRepository;
    private final ItemRepository itemRepository;

    @Transactional
    public void saveBomList(BomSaveRequest request) {
        for (BomDetailRequest row : request.getRows()) {
            if ("created".equals(row.getRowState()) ) {
                Long parentId = row.getParentItemId();
                Long childId = row.getChildItemId();

                if (parentId.equals(childId)) {
                    throw new IllegalArgumentException("자기 자신을 자식으로 지정할 수 없습니다.");
                }

                if (isAncestorOf(childId, parentId)) {
                    throw new IllegalArgumentException(String.format("순환 참조 발생 (↑ 상위에 이미 존재): %s → %s", childId, parentId));
                }

                if (hasDescendant(childId, parentId)) {
                    throw new IllegalArgumentException(String.format("순환 참조 발생 (↓ 하위에 이미 존재): %s → %s", childId, parentId));
                }
            }

            switch (row.getRowState()) {
                case "created" -> {
                    Bom newBom = Bom.builder()
                            .topItemId(request.getTopItemId())
                            .parentBomId(row.getParentBomId())
                            .parentItemId(row.getParentItemId())
                            .childItemId(row.getChildItemId())
                            .requiredQty(row.getRequiredQty())
                            .sortOrder(row.getSortOrder())
                            .memo(row.getMemo())
                            .build();
                    bomRepository.save(newBom);
                }

                case "updated" -> {
                    Bom existing = bomRepository.findById(row.getBomId())
                            .orElseThrow(() -> new EntityNotFoundException("수정할 BOM이 존재하지 않습니다. ID: " + row.getBomId()));
                    existing.update(row.getRequiredQty(), row.getSortOrder(), row.getMemo());
                }

                case "deleted" -> {
                    Bom bom = bomRepository.findById(row.getBomId())
                            .orElseThrow(() -> new EntityNotFoundException("삭제할 BOM이 존재하지 않습니다. ID: " + row.getBomId()));
                    bomRepository.delete(bom);
                }

                default -> throw new IllegalArgumentException("지원하지 않는 rowState: " + row.getRowState());
            }
        }
    }
    public List<BomTreeResponse> getBomTree(Long rootItemId) {
        List<BomTreeResponse> result = new ArrayList<>();
        buildTree(result, rootItemId, null, true, BigDecimal.ONE); // 기준 1개 생산
        return result;
    }

    /**
     * 전체 트리 구조를 조회 ex: topItemId에서 등록되지 않은 품목까지 조회
     * @param result
     * @param parentItemId
     * @param parentTreeId
     * @param isEditableRoot
     */
    private void buildTree(List<BomTreeResponse> result, Long parentItemId, String parentTreeId, boolean isEditableRoot, BigDecimal accumulatedQty) {
        List<Bom> children = bomQueryRepository.findChildren(parentItemId);

        for (int index = 0; index < children.size(); index++) {
            Bom bom = children.get(index);
            Long childItemId = bom.getChildItemId();
            String treeId = buildTreeId(parentTreeId, index);

            Item item = itemRepository.findById(childItemId)
                    .orElseThrow(() -> new IllegalStateException("Item not found: " + childItemId));

            BigDecimal requiredQty = bom.getRequiredQty();
            BigDecimal computedQty = accumulatedQty.multiply(requiredQty); // ✅ 누적 소요량

            boolean hasChild = bomQueryRepository.findChildren(childItemId).size() > 0;

            result.add(BomTreeResponse.builder()
                    .treeId(treeId)
                    .parentTreeId(parentTreeId)
                    .bomId(bom.getId())
                    .parentBomId(bom.getParentBomId())
                    .parentItemId(bom.getParentItemId())
                    .childItemId(bom.getChildItemId())
                    .itemCode(item.getCode())
                    .itemName(item.getName())
                    .spec(item.getSpec())
                    .requiredQty(computedQty) // ✅ 누적값으로 대체
                    .unit(item.getInventoryUnitCode())
                    .sortOrder(bom.getSortOrder())
                    .editable(isEditableRoot)
                    .hasChild(hasChild)
                    .build());

            buildTree(result, childItemId, treeId, false, computedQty);
        }
    }

    /**
     * 트리 ID 생성 유틸 (00, 0001 등 구조 유지)
     */
    private String buildTreeId(String parentTreeId, int index) {
        return (parentTreeId == null)
                ? String.format("%02d", index)
                : parentTreeId + String.format("%02d", index);
    }
/*

    // 최상위에 등록된 bom만 조회
    public List<BomTreeResponse> getBomTree(Long topItemId) {
        List<BomTreeResponse> result = new ArrayList<>();
        buildTree(result, topItemId, topItemId, null, true);
        return result;
    }

    private void buildTree(List<BomTreeResponse> result, Long topItemId, Long parentItemId, String parentTreeId, boolean isRootLevel) {
        List<Bom> children = bomQueryRepository.findChildrenByTopAndParentItemId(topItemId, parentItemId);

        int index = 0;
        for (Bom bom : children) {
            Long childItemId = bom.getChildItemId();

            String treeId = (parentTreeId == null)
                    ? String.format("%02d", index)
                    : parentTreeId + String.format("%02d", index);

            Item item = itemRepository.findById(childItemId)
                    .orElseThrow(() -> new IllegalStateException("Item not found: " + childItemId));

            boolean editable = isRootLevel; // ✅ 바로 아래 노드만 editable

            BomTreeResponse node = BomTreeResponse.builder()
                    .treeId(treeId)
                    .parentTreeId(parentTreeId)
                    .bomId(bom.getId())
                    .parentBomId(bom.getParentBomId())
                    .parentItemId(bom.getParentItemId())
                    .childItemId(bom.getChildItemId())
                    .itemCode(item.getCode())
                    .itemName(item.getName())
                    .spec(item.getSpec())
                    .requiredQty(bom.getRequiredQty())
                    .unit(item.getInventoryUnitCode())
                    .sortOrder(bom.getSortOrder())
                    .editable(editable) // ✅ 추가
                    .build();

            result.add(node);

            // 다음은 editable: false
            buildTree(result, topItemId, childItemId, treeId, false);

            index++;
        }
    }*/
//
//    private void buildTree(List<BomTreeResponse> result, Long topItemId, Long parentItemId, String parentTreeId) {
//        List<Bom> children = bomQueryRepository.findChildrenByTopAndParentItemId(topItemId, parentItemId);
//
//        int index = 0;
//        for (Bom bom : children) {
//            Long childItemId = bom.getChildItemId();
//
//            // ✅ 트리 ID 생성
//            String treeId = (parentTreeId == null)
//                    ? String.format("%02d", index)
//                    : parentTreeId + String.format("%02d", index);
//
//            Item item = itemRepository.findById(childItemId)
//                    .orElseThrow(() -> new IllegalStateException("Item not found: " + childItemId));
//
//            BomTreeResponse node = BomTreeResponse.builder()
//                    .treeId(treeId)
//                    .parentTreeId(parentTreeId)
//                    .bomId(bom.getId())
//                    .parentBomId(bom.getParentBomId())
//                    .parentItemId(bom.getParentItemId())
//                    .childItemId(bom.getChildItemId())
//                    .itemCode(item.getCode())
//                    .itemName(item.getName())
//                    .spec(item.getSpec())
//                    .requiredQty(bom.getRequiredQty())
//                    .unit(item.getInventoryUnitCode())
//                    .sortOrder(bom.getSortOrder())
//                    .build();
//
//            result.add(node);
//
//            // ✅ 재귀 호출 시에도 topItemId 유지
//            buildTree(result, topItemId, childItemId, treeId);
//
//            index++;
//        }
//    }

    // child → parent 방향: child가 이미 상위에 있다면 순환
    private boolean isAncestorOf(Long startItemId, Long targetItemId) {
        List<Bom> parentLinks = bomQueryRepository.findParentLinks(startItemId);
        for (Bom bom : parentLinks) {
            Long parentItemId = bom.getParentItemId();
            if (parentItemId.equals(targetItemId)) return true;
            if (isAncestorOf(parentItemId, targetItemId)) return true;
        }
        return false;
    }

    // parent → child 방향: child가 하위에 존재하면 순환
    private boolean hasDescendant(Long startItemId, Long targetItemId) {
        List<Bom> children = bomQueryRepository.findChildren(startItemId);
        for (Bom bom : children) {
            Long childId = bom.getChildItemId();
            if (childId.equals(targetItemId)) return true;
            if (hasDescendant(childId, targetItemId)) return true;
        }
        return false;
    }
}