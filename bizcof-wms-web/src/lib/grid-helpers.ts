import type { RealGridColumn } from '@/types/realgrid';

/**
 * 정렬 타입 (left=near, center, right=far)
 */
type Alignment = 'left' | 'center' | 'right';

/**
 * 정렬값을 styleName으로 변환
 */
function alignToStyleName(align?: Alignment): string | undefined {
  if (!align) return undefined;
  return `text-${align}`;
}

/**
 * RealGrid 컬럼 생성 헬퍼 함수
 *
 * 반복되는 기본값(type: 'data', editable: false)을 자동 설정하여
 * 컬럼 정의를 간결하게 만듭니다.
 *
 * @example
 * // 기본 사용
 * const columns = [
 *   col('code', '코드', 120),
 *   col('name', '이름', 200),
 * ];
 *
 * @example
 * // 정렬 옵션
 * const columns = [
 *   col('code', '코드', 120, { align: 'center' }),
 *   col('name', '이름', 200, { align: 'left' }),
 *   col('price', '가격', 100, { align: 'right' }),
 * ];
 *
 * @example
 * // 기타 옵션
 * const columns = [
 *   col('id', 'ID', 80, { visible: false }),
 *   col('price', '가격', 100, { dataType: 'number', numberFormat: '#,##0' }),
 *   col('status', '상태', 80, { editable: true }),
 * ];
 */
export function col(
  name: string,
  header: string,
  width: number,
  options?: Partial<RealGridColumn> & { align?: Alignment }
): RealGridColumn {
  const { align, styleName, ...rest } = options || {};
  const computedStyleName = alignToStyleName(align) || styleName;

  return {
    name,
    fieldName: rest?.fieldName || name,
    type: 'data',
    width,
    header: { text: header },
    editable: false,
    ...(computedStyleName && { styleName: computedStyleName }),
    ...rest,
  };
}

/** 확장 옵션 타입 (align 포함) */
type ColOptions = Partial<RealGridColumn> & { align?: Alignment };

/**
 * 숨김 컬럼 생성 헬퍼
 * ID 등 화면에 표시하지 않지만 데이터로 필요한 컬럼에 사용
 *
 * @example
 * const columns = [
 *   hiddenCol('id'),
 *   hiddenCol('customerId'),
 *   col('name', '이름', 200),
 * ];
 */
export function hiddenCol(name: string, options?: Partial<RealGridColumn>): RealGridColumn {
  return {
    name,
    fieldName: options?.fieldName || name,
    type: 'data',
    width: 0,
    header: { text: name },
    visible: false,
    editable: false,
    ...options,
  };
}

/**
 * 숫자 컬럼 생성 헬퍼
 * 천단위 구분자가 적용된 숫자 컬럼 (기본: 우측 정렬)
 *
 * @example
 * const columns = [
 *   numCol('qty', '수량', 100),
 *   numCol('price', '가격', 120, { editable: true }),
 *   numCol('amount', '금액', 120, { numberFormat: '#,##0.00' }),
 * ];
 */
export function numCol(
  name: string,
  header: string,
  width: number,
  options?: ColOptions
): RealGridColumn {
  const { align = 'right', styleName, ...rest } = options || {};
  const computedStyleName = alignToStyleName(align) || styleName;

  return {
    name,
    fieldName: rest?.fieldName || name,
    type: 'data',
    width,
    header: { text: header },
    editable: false,
    dataType: 'number',
    numberFormat: '#,##0',
    styleName: computedStyleName,
    ...rest,
  };
}

/**
 * 날짜 컬럼 생성 헬퍼 (기본: 중앙 정렬, 달력 에디터)
 *
 * @example
 * const columns = [
 *   dateCol('orderDate', '주문일'),
 *   dateCol('expireDate', '유통기한', 120, { editable: true }),
 * ];
 */
export function dateCol(
  name: string,
  header: string,
  width: number = 100,
  options?: ColOptions
): RealGridColumn {
  const { align = 'center', styleName, ...rest } = options || {};
  const computedStyleName = alignToStyleName(align) || styleName;

  return {
    name,
    fieldName: rest?.fieldName || name,
    type: 'data',
    width,
    header: { text: header },
    editable: false,
    dataType: 'datetime',
    datetimeFormat: 'yyyy-MM-dd',
    editor: {
      type: 'date',
      mask: {
        editMask: '9999-99-99',
        includedFormat: true,
      },
    },
    ...(computedStyleName && { styleName: computedStyleName }),
    ...rest,
  };
}

