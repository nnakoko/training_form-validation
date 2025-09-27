// 型定義ファイル

// バリデーション状態
export interface ValidationState {
    prefecture: boolean;
    gender: boolean;
    lastName: boolean;
    firstName: boolean;
    lastNameKana: boolean;
    firstNameKana: boolean;
    phone: boolean;
    email: boolean;
}

// フォームデータ
export interface FormData {
    prefecture: string;
    gender: string;
    lastName: string;
    firstName: string;
    lastNameKana: string;
    firstNameKana: string;
    phone: string;
    email: string;
    message: string;
}

// 性別のテキストマッピング
export interface GenderText {
    male: string;
    female: string;
    other: string;
}

// DOM要素の型
export interface FormElements {
    form: HTMLFormElement;
    submitBtn: HTMLButtonElement;
    confirmScreen: HTMLDivElement;
    confirmContent: HTMLDivElement;
    backBtn: HTMLButtonElement;
    completeBtn: HTMLButtonElement;
    prefecture: HTMLSelectElement;
    genderInputs: NodeListOf<HTMLInputElement>;
    lastName: HTMLInputElement;
    firstName: HTMLInputElement;
    lastNameKana: HTMLInputElement;
    firstNameKana: HTMLInputElement;
    phone: HTMLInputElement;
    email: HTMLInputElement;
    message: HTMLTextAreaElement;
    charCount: HTMLSpanElement;
}

// カタカナ変換結果
export interface KanaConversionResult {
    success: boolean;
    result: string;
    method: string;
    error?: string;
}
