// バリデーション機能
import { ValidationState } from '../types';

// バリデーション状態の初期化
export const initialValidationState: ValidationState = {
    prefecture: false,
    gender: false,
    lastName: false,
    firstName: false,
    lastNameKana: false,
    firstNameKana: false,
    phone: false,
    email: false
};

// エラーメッセージの表示
export function showError(elementId: string, message: string): void {
    const errorElement = document.getElementById(`${elementId}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        const inputElement = document.getElementById(elementId);
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }
}

// エラーメッセージのクリア
export function clearError(elementId: string): void {
    const errorElement = document.getElementById(`${elementId}-error`);
    if (errorElement) {
        errorElement.textContent = '';
        const inputElement = document.getElementById(elementId);
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }
}

// 都道府県のバリデーション
export function validatePrefecture(prefecture: HTMLSelectElement): boolean {
    if (!prefecture.value) {
        showError('prefecture', '都道府県を選択してください');
        return false;
    }
    clearError('prefecture');
    return true;
}

// 性別のバリデーション
export function validateGender(genderInputs: NodeListOf<HTMLInputElement>): boolean {
    const selectedGender = Array.from(genderInputs).find(input => input.checked);
    if (!selectedGender) {
        showError('gender', '性別を選択してください');
        return false;
    }
    clearError('gender');
    return true;
}

// 名前のバリデーション
export function validateName(name: string, fieldName: string): boolean {
    if (!name.trim()) {
        showError(fieldName, `${fieldName === 'lastName' ? '姓' : '名'}を入力してください`);
        return false;
    }
    if (name.length > 20) {
        showError(fieldName, '20文字以内で入力してください');
        return false;
    }
    clearError(fieldName);
    return true;
}

// カタカナのバリデーション
export function validateKana(kana: string, fieldName: string): boolean {
    if (!kana.trim()) {
        showError(fieldName, `${fieldName === 'lastNameKana' ? 'セイ' : 'メイ'}を入力してください`);
        return false;
    }
    if (!/^[ァ-ヶー]+$/.test(kana)) {
        showError(fieldName, 'カタカナで入力してください');
        return false;
    }
    clearError(fieldName);
    return true;
}

// 電話番号のバリデーション
export function validatePhone(phone: HTMLInputElement): boolean {
    const phoneValue = phone.value.replace(/[^\d]/g, '');
    if (!phoneValue) {
        showError('phone', '電話番号を入力してください');
        return false;
    }

    if (phoneValue.length < 10 || phoneValue.length > 11) {
        showError('phone', '電話番号は10桁または11桁で入力してください');
        return false;
    }

    if (phoneValue.startsWith('080') || phoneValue.startsWith('090')) {
        if (phoneValue.length !== 11) {
            showError('phone', '携帯電話番号は11桁で入力してください');
            return false;
        }
    }

    clearError('phone');
    return true;
}

// メールアドレスのバリデーション
export function validateEmail(email: HTMLInputElement): boolean {
    const emailValue = email.value.trim();
    if (!emailValue) {
        showError('email', 'メールアドレスを入力してください');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
        showError('email', '正しいメールアドレスの形式で入力してください');
        return false;
    }

    clearError('email');
    return true;
}

// 全項目のバリデーション
export function validateAllFields(elements: any): boolean {
    const isPrefectureValid = validatePrefecture(elements.prefecture);
    const isGenderValid = validateGender(elements.genderInputs);
    const isLastNameValid = validateName(elements.lastName.value, 'lastName');
    const isFirstNameValid = validateName(elements.firstName.value, 'firstName');
    const isLastNameKanaValid = validateKana(elements.lastNameKana.value, 'lastNameKana');
    const isFirstNameKanaValid = validateKana(elements.firstNameKana.value, 'firstNameKana');
    const isPhoneValid = validatePhone(elements.phone);
    const isEmailValid = validateEmail(elements.email);

    return isPrefectureValid && isGenderValid && isLastNameValid && isFirstNameValid &&
           isLastNameKanaValid && isFirstNameKanaValid && isPhoneValid && isEmailValid;
}
