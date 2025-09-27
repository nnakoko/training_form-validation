// メインアプリケーション
import "./styles/main.scss";
import { ValidationState } from './types';
import {
    validatePrefecture,
    validateGender,
    validateName,
    validateKana,
    validatePhone,
    validateEmail
} from './utils/validation';
import { convertToKana } from './utils/kana-converter-simple';
import {
    getFormElements,
    updateSubmitButton,
    updateCharCount,
    handleFormSubmit,
    backToForm,
    completeSubmission
} from './utils/form-manager';
import { waitForWanakana } from './utils/library-manager';

// DOM読み込み完了を待つ
document.addEventListener('DOMContentLoaded', () => {
    // フォーム要素の取得
    const elements = getFormElements();

    // バリデーション状態
    const validationState: ValidationState = {
        prefecture: false,
        gender: false,
        lastName: false,
        firstName: false,
        lastNameKana: false,
        firstNameKana: false,
        phone: false,
        email: false
    };

    // カタカナ変換処理
    async function handleKanaConversion(inputElement: HTMLInputElement, kanaElement: HTMLInputElement, fieldName: string): Promise<void> {
        const inputValue = inputElement.value.trim();

        if (inputValue) {
            try {
                const conversionResult = convertToKana(inputValue);

                if (conversionResult.success && conversionResult.result !== inputValue) {
                    kanaElement.value = conversionResult.result;
                    validateKana(conversionResult.result, fieldName);
                    console.log(`✅ ${fieldName} カタカナ変換: "${inputValue}" -> "${conversionResult.result}"`);
                } else {
                    console.log(`⚠️ ${fieldName} カタカナ変換失敗または変換不要: "${inputValue}"`);
                }
            } catch (error) {
                console.error(`❌ ${fieldName} カタカナ変換エラー:`, error);
            }
        } else {
            // 入力が空の場合はカタカナフィールドもクリア
            kanaElement.value = '';
            validationState[fieldName as keyof ValidationState] = false;
        }

        updateSubmitButton(validationState, elements.submitBtn);
    }

    // イベントリスナーの設定
    elements.prefecture.addEventListener('change', () => {
        validationState.prefecture = validatePrefecture(elements.prefecture);
        updateSubmitButton(validationState, elements.submitBtn);
    });

    elements.prefecture.addEventListener('blur', () => {
        validationState.prefecture = validatePrefecture(elements.prefecture);
        updateSubmitButton(validationState, elements.submitBtn);
    });

    elements.genderInputs.forEach(input => {
        input.addEventListener('change', () => {
            validationState.gender = validateGender(elements.genderInputs);
            updateSubmitButton(validationState, elements.submitBtn);
        });
    });

    // lastNameのイベントリスナー
    elements.lastName.addEventListener('blur', async () => {
        validationState.lastName = validateName(elements.lastName.value, 'lastName');
        await handleKanaConversion(elements.lastName, elements.lastNameKana, 'lastName');
    });

    elements.lastName.addEventListener('input', () => {
        if (!elements.lastName.value.trim()) {
            elements.lastNameKana.value = '';
            validationState.lastNameKana = false;
        }
        validationState.lastName = validateName(elements.lastName.value, 'lastName');
        updateSubmitButton(validationState, elements.submitBtn);
    });

    // firstNameのイベントリスナー
    elements.firstName.addEventListener('blur', async () => {
        validationState.firstName = validateName(elements.firstName.value, 'firstName');
        await handleKanaConversion(elements.firstName, elements.firstNameKana, 'firstName');
    });

    elements.firstName.addEventListener('input', () => {
        if (!elements.firstName.value.trim()) {
            elements.firstNameKana.value = '';
            validationState.firstNameKana = false;
        }
        validationState.firstName = validateName(elements.firstName.value, 'firstName');
        updateSubmitButton(validationState, elements.submitBtn);
    });

    // カタカナフィールドのイベントリスナー
    elements.lastNameKana.addEventListener('input', () => {
        validationState.lastNameKana = validateKana(elements.lastNameKana.value, 'lastNameKana');
        updateSubmitButton(validationState, elements.submitBtn);
    });

    elements.lastNameKana.addEventListener('blur', () => {
        validationState.lastNameKana = validateKana(elements.lastNameKana.value, 'lastNameKana');
        updateSubmitButton(validationState, elements.submitBtn);
    });

    elements.firstNameKana.addEventListener('input', () => {
        validationState.firstNameKana = validateKana(elements.firstNameKana.value, 'firstNameKana');
        updateSubmitButton(validationState, elements.submitBtn);
    });

    elements.firstNameKana.addEventListener('blur', () => {
        validationState.firstNameKana = validateKana(elements.firstNameKana.value, 'firstNameKana');
        updateSubmitButton(validationState, elements.submitBtn);
    });

    // 電話番号のイベントリスナー
    elements.phone.addEventListener('input', () => {
        // 数字以外の文字を除去
        elements.phone.value = elements.phone.value.replace(/[^\d]/g, '');
        validationState.phone = validatePhone(elements.phone);
        updateSubmitButton(validationState, elements.submitBtn);
    });

    elements.phone.addEventListener('blur', () => {
        validationState.phone = validatePhone(elements.phone);
        updateSubmitButton(validationState, elements.submitBtn);
    });

    // メールアドレスのイベントリスナー
    elements.email.addEventListener('blur', () => {
        validationState.email = validateEmail(elements.email);
        updateSubmitButton(validationState, elements.submitBtn);
    });

    // メッセージのイベントリスナー
    elements.message.addEventListener('input', () => {
        updateCharCount(elements.message, elements.charCount);
    });

    // フォーム送信
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(elements, validationState);
    });

    // ボタンのイベントリスナー
    elements.backBtn.addEventListener('click', () => backToForm(elements));
    elements.completeBtn.addEventListener('click', () => completeSubmission(elements, validationState));

    // Wanakanaの読み込み完了を待ってからアプリケーションを初期化
    waitForWanakana().then((wanakanaLoaded) => {
        if (!wanakanaLoaded) {
            console.warn('⚠️ Wanakana not available, continuing with limited functionality...');
        }

        // アプリケーションの初期化
        updateSubmitButton(validationState, elements.submitBtn);
        updateCharCount(elements.message, elements.charCount);

        console.log('✅ Application initialized successfully');
    }).catch((error) => {
        console.error('❌ Error during Wanakana loading:', error);
        // エラーが発生してもアプリケーションは継続
        updateSubmitButton(validationState, elements.submitBtn);
        updateCharCount(elements.message, elements.charCount);
    });
});