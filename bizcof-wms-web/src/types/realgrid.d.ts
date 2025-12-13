// RealGrid2 타입 정의
declare global {
  interface Window {
    RealGrid: any;
  }
}

export interface RealGridColumn {
  name: string;
  fieldName: string;
  type?: 'data' | 'group';
  width?: number;
  header?: {
    text: string;
    styleName?: string;
  };
  editable?: boolean;
  visible?: boolean;
  /**
   * 텍스트 정렬 (styles 객체 내에서 사용)
   * @deprecated 직접 사용 불가. styleName 또는 styles 속성 사용 권장
   * - styleName: 'text-left' | 'text-center' | 'text-right'
   * - styles: { textAlignment: 'near' | 'center' | 'far' }
   */
  textAlignment?: 'near' | 'center' | 'far';
  /** RealGrid 스타일 객체 */
  styles?: {
    textAlignment?: 'near' | 'center' | 'far';
    [key: string]: any;
  };
  datetimeFormat?: string;
  numberFormat?: string;
  /** 셀 에디터 설정 */
  editor?: {
    type?: 'text' | 'number' | 'date' | 'datetime' | 'dropdown' | 'multiline';
    [key: string]: any;
  };
  renderer?: any;
  /** CSS 클래스명 (text-left, text-center, text-right 등) */
  styleName?: string;
  styleCallback?: (grid: any, dataCell: any) => string;
  dataType?: 'text' | 'number' | 'boolean' | 'datetime' | 'date';
}

export interface RealGridField {
  fieldName: string;
  dataType?: 'text' | 'number' | 'boolean' | 'datetime' | 'date';
}

export interface RealGridOptions {
  display?: {
    rowHeight?: number;
    fitStyle?: 'none' | 'even' | 'fill' | 'equalHeight';
  };
  checkBar?: {
    visible?: boolean;
  };
  stateBar?: {
    visible?: boolean;
  };
  edit?: {
    editable?: boolean;
    insertable?: boolean;
    appendable?: boolean;
    updatable?: boolean;
    deletable?: boolean;
  };
}

export {};
