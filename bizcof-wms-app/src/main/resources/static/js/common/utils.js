// utils.js - 공통 유틸리티 함수 모음

import {FetchApi} from "/js/common/fetch-api.js";

/**
 * 📌 폼 유효성 검사 실행
 * - 기본 HTML5 유효성 검사 + readonly + required 필드 수동 검사 포함
 * - Bootstrap 스타일용 class 추가
 * @param {HTMLFormElement} formElement
 * @returns {boolean} - 모든 필드 유효 시 true 반환
 */
export function validateFields(formElement) {
    const readonlyRequiredInputs = formElement.querySelectorAll("input[readonly][required]");
    let isValid = formElement.checkValidity();

    readonlyRequiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add("is-invalid");
            input.classList.remove("is-valid");
            isValid = false;
        } else {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
        }

        input.addEventListener("input", () => {
            const filled = input.value.trim();
            input.classList.toggle("is-invalid", !filled);
            input.classList.toggle("is-valid", !!filled);
        });
    });

    formElement.classList.add("was-validated");
    return isValid;
}

/**
 * 📌 폼의 유효성 클래스 초기화
 * @param {HTMLFormElement} formElement
 */
export function resetValidationState(formElement) {
    const inputs = formElement.querySelectorAll("input, select, textarea");
    inputs.forEach(input => input.classList.remove("is-valid", "is-invalid"));
    formElement.classList.remove("was-validated");
}

/**
 * 📌 검색 조건 영역 내 필수값(required) 체크
 * - search-body 영역 내 data-search 속성과 required가 동시에 있는 요소 검사
 * - 빈 값이 하나라도 있으면 경고 메시지 출력 후 false 반환
 * @returns {boolean} - 모든 필수값이 입력되었을 경우 true
 */
export function checkRequiredSearchFields() {
    const inputs = document.querySelectorAll('[data-search][required]');
    for (const input of inputs) {
        const value = input.value?.trim();
        const label = input.closest(".form-group, .col-md-3")?.querySelector("label")?.textContent?.trim();

        if (!value) {
            input.classList.add("is-invalid");
            showMessageModal("warning", `검색조건 [${label || input.name}]은 필수 입력입니다.`);
            return false;
        } else {
            input.classList.remove("is-invalid");
        }
    }
    return true;
}

/**
 * 📌 Readonly + Required 필드 단건 유효성 갱신
 * @param {HTMLInputElement} input
 */
export function updateReadonlyValidation(input) {
    const filled = !!input.value.trim();
    input.classList.toggle('is-invalid', !filled);
    input.classList.toggle('is-valid', filled);
}

/**
 * 📌 검색 파라미터 생성 (data-search 속성 기준)
 * - DateRangePicker의 startKey/endKey 처리 포함
 * @param {HTMLElement} container
 * @returns {Object}
 */
export function getSearchParams(container = document) {
    const searchInputs = container.querySelectorAll("[data-search]");
    const params = {};

    searchInputs.forEach(el => {
        const $el = $(el);
        const key = el.name || el.id;
        const value = el.value?.trim();

        const startKey = $el.data("startKey");
        const endKey = $el.data("endKey");
        const picker = $el.data("daterangepicker");

        // 기간 검색
        if (picker) {
            if (startKey) params[startKey] = picker.startDate?.format('YYYY-MM-DD');
            if (endKey) params[endKey] = picker.endDate?.format('YYYY-MM-DD');
        } else if (key && value !== "") {
            params[key] = value;
        }
    });

    return params;
}

/**
 * 📌 AdminLTE Toast 메시지 표시
 * @param {string} message
 * @param {string} type - success, warning, danger, info 등
 */
export function showToast(message, type = 'info') {
    let toastClass = 'bg-info';
    switch (type) {
        case 'success':
            toastClass = 'bg-success';
            break;
        case 'error':
        case 'danger':
            toastClass = 'bg-danger';
            break;
        case 'warning':
            toastClass = 'bg-warning';
            break;
        case 'secondary':
            toastClass = 'bg-secondary';
            break;
    }

    $(document).Toasts('create', {
        class: toastClass,
        body: message,
        autohide: true,
        close: false,
        delay: 3000,
        fade: true,
        autoremove: true
    });
}

/**
 * 📌 RealGrid SKU → BOX, PLT 수량 환산 계산
 * @param {number} inboundQty
 * @param {number} boxPerSkuQty
 * @param {number} pltPerSkuQty
 * @returns {{ boxQty: number, pltQty: number }}
 */
export function calculateUnitQty(inboundQty, boxPerSkuQty, pltPerSkuQty) {
    if (!inboundQty || inboundQty <= 0) return {boxQty: 0, pltQty: 0};
    const boxQty = boxPerSkuQty > 0 ? Math.floor(inboundQty / boxPerSkuQty) : 0;
    const pltQty = pltPerSkuQty > 0 ? Math.floor(inboundQty / pltPerSkuQty) : 0;
    return {boxQty, pltQty};
}

/**
 * 📌 RealGrid 필수입력값 유효성 검사
 * @param {GridView} gridView
 * @param {LocalDataProvider} dataProvider
 * @param {string} gridName
 * @returns {boolean}
 */
export function validateGridFields(gridView, dataProvider, gridName = "그리드") {
    const rowCount = dataProvider.getRowCount();
    if (rowCount === 0) {
        showMessageModal("warning",`${gridName}에 입력된 데이터가 없습니다.`);
        return false;
    }

    const requiredFields = gridView.getColumnNames(true).filter(fieldName => {
        const column = gridView.columnByName(fieldName);
        return column?.required === true;
    });

    for (let row = 0; row < rowCount; row++) {
        for (const field of requiredFields) {
            const value = dataProvider.getValue(row, field);
            if (value === null || value === undefined || value === "") {
                const label = gridView.columnByName(field)?.header?.text || field;
                showMessageModal("warning", `${gridName} ${row + 1}행의 [${label}]은 필수 입력 항목입니다.`);
                return false;
            }
        }
    }

    return true;
}

/**
 * 📌 메시지 모달 표시
 * @param {'info'|'success'|'warning'|'error'} type
 * @param {string} message
 * @param {{ title?: string, onConfirm?: function }} option
 */
export function showMessageModal(type = "info", message = "", option = {}) {
    const modal = document.getElementById("messageModal");
    if (!modal) return;

    const $modal = $('#messageModal');
    const icon = modal.querySelector("#messageModalIcon");
    const title = modal.querySelector("#messageModalTitle");
    const body = modal.querySelector("#messageModalBody");

    const typeMap = {
        info: {icon: "fa-info-circle", color: "text-info", title: "알림"},
        success: {icon: "fa-check-circle", color: "text-success", title: "성공"},
        warning: {icon: "fa-exclamation-circle", color: "text-warning", title: "경고"},
        error: {icon: "fa-times-circle", color: "text-danger", title: "오류"}
    };

    const config = typeMap[type] || typeMap["info"];

    icon.className = `fas ${config.icon} ${config.color} fa-lg`;
    title.textContent = option.title || config.title;
    body.textContent = message;

    document.querySelectorAll(".modal.show").forEach(m => {
        if (!m.id.includes("messageModal")) {
            m.classList.add("modal-faded");
        }
    });


    $modal.on("hidden.bs.modal", () => {
        document.querySelectorAll(".modal.modal-faded").forEach(m => m.classList.remove("modal-faded"));
    });
    modal.querySelector("#messageModalConfirm").onclick = () => {
        document.activeElement?.blur(); // console warn로그로 인한 처리,  오류: Blocked aria-hidden on an element because its descendant retained focus.
        $modal.modal("hide");

        if (typeof option.onConfirm === "function") option.onConfirm();
    };

    $modal.modal({backdrop: "static", keyboard: false});
}

/**
 * 📌 확인 모달 표시 및 비동기 처리
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export function showConfirmModal(message = "계속하시겠습니까?") {
    return new Promise((resolve) => {
        const modal = document.getElementById("confirmModal");
        if (!modal) return resolve(false);


        const $modal = $('#confirmModal');
        modal.querySelector("#confirmModalMessage").textContent = message;

        document.querySelectorAll(".modal.show").forEach(m => {
            if (!m.id.includes("confirmModal")) {
                m.classList.add("modal-faded");
            }
        });

        $modal.on("hidden.bs.modal", () => {
            document.querySelectorAll(".modal.modal-faded").forEach(m => m.classList.remove("modal-faded"));
        });

        modal.querySelector("#confirmModalYes").onclick = () => {
            document.activeElement?.blur(); // console warn로그로 인한 처리,  오류: Blocked aria-hidden on an element because its descendant retained focus.
            $modal.modal("hide");
            resolve(true);
        };
        modal.querySelector("#confirmModalCancel").onclick = () => {
            document.activeElement?.blur(); // console warn로그로 인한 처리,  오류: Blocked aria-hidden on an element because its descendant retained focus.
            $modal.modal("hide");
            resolve(false);
        };

        $modal.modal({backdrop: "static", keyboard: false});
    });
}

/**
 * 📌 DateRangePicker 초기화
 * @param {string} id - input ID
 * @param {{ preset?: string, onChange?: function, startKey?: string, endKey?: string }} options
 */
export function initDateRangePicker(id, options = {}) {
    const selector = `#${id}`;
    const $el = $(selector);

    const presets = {
        today: [moment(), moment()],
        yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        last7days: [moment().subtract(6, 'days'), moment()],
        last30days: [moment().subtract(29, 'days'), moment()],
        thisMonth: [moment().startOf('month'), moment().endOf('month')],
        lastMonth: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
        thisYear: [moment().startOf('year'), moment()]
    };

    const range = presets[options.preset] || null;
    const onChange = typeof options.onChange === 'function' ? options.onChange : () => {
    };
    const startKey = options.startKey || 'startDate';
    const endKey = options.endKey || 'endDate';

    const config = {
        locale: {
            format: 'YYYY-MM-DD',
            separator: ' ~ ',
            applyLabel: '확인',
            cancelLabel: '취소',
            daysOfWeek: ['일', '월', '화', '수', '목', '금', '토'],
            monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            firstDay: 0
        },
        autoUpdateInput: false,
        alwaysShowCalendars: true,
        ranges: {
            '오늘': presets.today,
            '어제': presets.yesterday,
            '최근 7일': presets.last7days,
            '최근 30일': presets.last30days,
            '이번 달': presets.thisMonth,
            '지난 달': presets.lastMonth,
            '올해': presets.thisYear
        }
    };

    $el.data("startKey", startKey);
    $el.data("endKey", endKey);

    if (range) {
        config.startDate = range[0];
        config.endDate = range[1];
    }

    $el.daterangepicker(config);

    $el.on('apply.daterangepicker', function (ev, picker) {
        const start = picker.startDate.format('YYYY-MM-DD');
        const end = picker.endDate.format('YYYY-MM-DD');
        $(this).val(`${start} ~ ${end}`);
        $(this).data(startKey, start);
        $(this).data(endKey, end);
        onChange(start, end);
    });

    $el.on('cancel.daterangepicker', function () {
        $(this).val('');
        $(this).removeData(startKey).removeData(endKey);
        onChange(null, null);
    });

    const iconTrigger = document.querySelector(`#${id}`)?.closest('.input-group')?.querySelector('.input-group-text');
    if (iconTrigger) {
        iconTrigger.addEventListener('click', () => $el.trigger('click'));
    }

    if (range) {
        const [start, end] = range;
        const startStr = start.format('YYYY-MM-DD');
        const endStr = end.format('YYYY-MM-DD');
        $el.val(`${startStr} ~ ${endStr}`);
        $el.data(startKey, startStr);
        $el.data(endKey, endStr);
        onChange(startStr, endStr);
    }
}

/**
 * 📌 DateRangePicker 값 추출
 * @param {string} selector
 * @returns {{ startDate: string|null, endDate: string|null }}
 */
export function getDateRangeValue(selector) {
    const $el = $(selector);
    return {
        startDate: $el.data('start-date') || null,
        endDate: $el.data('end-date') || null
    };
}

/**
 * 📌 단일 날짜 선택용 DatePicker 초기화 (Tempus Dominus)
 * @param {string} id
 */
export function initDatePicker(id, options = {}) {
    const target = document.getElementById(id);
    if (!target) return;

    moment.locale('ko');

    // 기본 옵션과 사용자 전달 옵션을 병합
    options = Object.assign({
        format: 'YYYY-MM-DD',
        locale: 'ko',
        useCurrent: false,
        useTodayDefault: true
    }, options);

    if (options.useTodayDefault && !options.defaultDate) {
        options.defaultDate = moment();
    }

    $(`#${id}`).datetimepicker(options);

    if (options.useTodayDefault && !target.value) {
        target.value = moment().format('YYYY-MM-DD');
    }

    $(`#${id}`).on('change.datetimepicker', function (e) {
        const date = e.date?.format('YYYY-MM-DD') || '';
        if (typeof options.onChange === 'function') options.onChange(date);
    });
}


/**
 * 📌 공통 코드 기반으로 select 요소 옵션 설정
 * @param {string} groupCode - 서버 코드 그룹 ID
 * @param {string} selectId - select 요소 ID
 * @param {Object} options - 설정 옵션
 *        - includeDefault {boolean} - '선택하세요' 옵션 포함 여부 (default: true)
 *        - defaultText {string} - 기본 옵션 텍스트 (default: '선택하세요')
 *        - selectedValue {string} - 선택되어야 할 기본 값
 */
export async function initCommonCode(groupCode, selectId, options = {}) {
  const {
    includeDefault = true,
    defaultText = '선택하세요',
    selectedValue = ''
  } = options;

  const select = document.getElementById(selectId);
  if (!select) {
    console.warn(`[bindSelectOptions] ID가 '${selectId}'인 select 요소를 찾을 수 없습니다.`);
    return;
  }

  select.innerHTML = ''; // 기존 옵션 초기화

  try {
    const res = await FetchApi(`/api/system/code/${groupCode}`, 'GET');
    const items = res.data || [];
    if (includeDefault) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = defaultText;
      select.appendChild(opt);
    }

    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.commonCode;
      option.textContent = item.commonName;
      if (selectedValue && selectedValue === item.commonCode) {
        option.selected = true;
      }
      select.appendChild(option);
    });

  } catch (e) {
    console.error('공통 코드 조회 실패:', e);
    showMessageModal('error', `코드(${groupCode}) 정보를 불러오지 못했습니다.`);
  }
}

/**
 * ✅ RealGrid2에서 변경된 데이터 추출 (추가, 수정된 행)
 * @param {LocalDataProvider | LocalTreeDataProvider} dataProvider
 * @returns {Array<Object>} 변경된 행 목록
 */
export function getTargetJson(dataProvider) {
  const createdRows = dataProvider.getAllStateRows("created");
  const updatedRows = dataProvider.getAllStateRows("updated");

  const changedRows = [];

  // 생성된 행
  for (const row of createdRows) {
    changedRows.push({
      ...dataProvider.getJsonRow(row),
      _rowType: "created"
    });
  }

  // 수정된 행
  for (const row of updatedRows) {
    // 수정 + 생성된 행이 중복되지 않도록 필터
    if (!createdRows.includes(row)) {
      changedRows.push({
        ...dataProvider.getJsonRow(row),
        _rowType: "updated"
      });
    }
  }

  return changedRows;
}

/**
 * 그리드 행 삭제 처리 (공통)
 * 저장된 행은 isDeleted='Y' 플래그 처리, 신규 행은 removeRow
 * @param {RealGrid.GridView} gridView - 그리드 뷰 객체
 * @param {RealGrid.LocalDataProvider} provider - 데이터 프로바이더 객체
 * @param {string} [idField='id'] - 식별 필드명 (기본: 'id')
 */
export function handleGridRowDelete(gridView, provider, idField = 'id') {
  const current = gridView.getCurrent();
  if (!current || current.dataRow < 0) {
    showMessageModal('warning', '삭제할 행을 선택해주세요.');
    return;
  }

  const rowId = provider.getValue(current.dataRow, idField);
  if (!rowId) {
    provider.removeRow(current.dataRow);
  } else {
    provider.setValue(current.dataRow, "isDeleted", "Y");
    gridView.setRowStyleCallback((grid, item) => {
      return provider.getValue(item.dataRow, "isDeleted") ? "deleted-row" : null;
    });
  }
}