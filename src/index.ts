import "./styles/main.scss";
import {
    initializeAdvancedConverter,
    convertToKanaWithAdvanced,
    testYahooApiConnection
} from './utils/kana-converter';
import { validateApiKey, getMaskedApiKey } from './config/api-config';



// DOM読み込み完了を待つ
document.addEventListener('DOMContentLoaded', () => {

// Wanakanaの読み込み完了を待つ関数（イベントベース）
function waitForWanakana(): Promise<boolean> {
    return new Promise((resolve) => {
        // まず即座にWanakanaが利用可能かチェック
        if (typeof window.wanakana !== 'undefined') {
            console.log('✅ Wanakana already available');
            resolve(true);
            return;
        }

        // カスタムイベントをリッスン
        const handleWanakanaLoaded = () => {
            console.log('✅ Wanakana loaded event received');
            window.removeEventListener('wanakanaLoaded', handleWanakanaLoaded);
            window.removeEventListener('wanakanaError', handleWanakanaError);
            resolve(true);
        };

        const handleWanakanaError = (event: Event) => {
            console.error('❌ Wanakana error event received:', (event as CustomEvent).detail);
            window.removeEventListener('wanakanaLoaded', handleWanakanaLoaded);
            window.removeEventListener('wanakanaError', handleWanakanaError);
            resolve(false);
        };

        window.addEventListener('wanakanaLoaded', handleWanakanaLoaded);
        window.addEventListener('wanakanaError', handleWanakanaError);

        // タイムアウト設定（5秒に短縮）
        setTimeout(() => {
            console.warn('⚠️ Wanakana loading timeout after 5 seconds');
            window.removeEventListener('wanakanaLoaded', handleWanakanaLoaded);
            window.removeEventListener('wanakanaError', handleWanakanaError);
            resolve(false);
        }, 5000);
    });
}

    // フォーム要素の取得
    const form = document.getElementById('userForm') as HTMLFormElement;
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
const confirmScreen = document.getElementById('confirmScreen') as HTMLDivElement;
const confirmContent = document.getElementById('confirmContent') as HTMLDivElement;
const backBtn = document.getElementById('backBtn') as HTMLButtonElement;
const completeBtn = document.getElementById('completeBtn') as HTMLButtonElement;

// 入力要素の取得
const prefecture = document.getElementById('prefecture') as HTMLSelectElement;
const genderInputs = document.querySelectorAll('input[name="gender"]') as NodeListOf<HTMLInputElement>;
const lastName = document.getElementById('lastName') as HTMLInputElement;
const firstName = document.getElementById('firstName') as HTMLInputElement;
const lastNameKana = document.getElementById('lastNameKana') as HTMLInputElement;
const firstNameKana = document.getElementById('firstNameKana') as HTMLInputElement;
const phone = document.getElementById('phone') as HTMLInputElement;
const email = document.getElementById('email') as HTMLInputElement;
const message = document.getElementById('message') as HTMLTextAreaElement;
const charCount = document.getElementById('charCount') as HTMLSpanElement;


// バリデーション状態
interface ValidationState {
    prefecture: boolean;
    gender: boolean;
    lastName: boolean;
    firstName: boolean;
    lastNameKana: boolean;
    firstNameKana: boolean;
    phone: boolean;
    email: boolean;
}

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

// エラーメッセージの表示
function showError(elementId: string, message: string): void {
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
function clearError(elementId: string): void {
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
function validatePrefecture(): boolean {
    if (!prefecture.value) {
        showError('prefecture', '都道府県を選択してください');
        validationState.prefecture = false;
        return false;
    }
    clearError('prefecture');
    validationState.prefecture = true;
    return true;
}

// 性別のバリデーション
function validateGender(): boolean {
    const selectedGender = Array.from(genderInputs).find(input => input.checked);
    if (!selectedGender) {
        showError('gender', '性別を選択してください');
        validationState.gender = false;
        return false;
    }
    clearError('gender');
    validationState.gender = true;
    return true;
}

// 名前のバリデーション
function validateName(name: string, fieldName: string): boolean {
    if (!name.trim()) {
        showError(fieldName, `${fieldName === 'lastName' ? '姓' : '名'}を入力してください`);
        validationState[fieldName as keyof ValidationState] = false;
        return false;
    }
    if (name.length > 20) {
        showError(fieldName, '20文字以内で入力してください');
        validationState[fieldName as keyof ValidationState] = false;
        return false;
    }
    clearError(fieldName);
    validationState[fieldName as keyof ValidationState] = true;
    return true;
}

// カタカナのバリデーション
function validateKana(kana: string, fieldName: string): boolean {
    if (!kana.trim()) {
        showError(fieldName, `${fieldName === 'lastNameKana' ? 'セイ' : 'メイ'}を入力してください`);
        validationState[fieldName as keyof ValidationState] = false;
        return false;
    }
    if (!/^[ァ-ヶー]+$/.test(kana)) {
        showError(fieldName, 'カタカナで入力してください');
        validationState[fieldName as keyof ValidationState] = false;
        return false;
    }
    clearError(fieldName);
    validationState[fieldName as keyof ValidationState] = true;
    return true;
}

// 電話番号のバリデーション
function validatePhone(): boolean {
    const phoneValue = phone.value.replace(/[^\d]/g, '');
    if (!phoneValue) {
        showError('phone', '電話番号を入力してください');
        validationState.phone = false;
        return false;
    }

    if (phoneValue.length < 10 || phoneValue.length > 11) {
        showError('phone', '電話番号は10桁または11桁で入力してください');
        validationState.phone = false;
        return false;
    }

    if (phoneValue.startsWith('080') || phoneValue.startsWith('090')) {
        if (phoneValue.length !== 11) {
            showError('phone', '携帯電話番号は11桁で入力してください');
            validationState.phone = false;
            return false;
        }
    }

    clearError('phone');
    validationState.phone = true;
    return true;
}

// メールアドレスのバリデーション
function validateEmail(): boolean {
    const emailValue = email.value.trim();
    if (!emailValue) {
        showError('email', 'メールアドレスを入力してください');
        validationState.email = false;
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
        showError('email', '正しいメールアドレスの形式で入力してください');
        validationState.email = false;
        return false;
    }

    clearError('email');
    validationState.email = true;
    return true;
}

// 送信ボタンの有効/無効を切り替え
function updateSubmitButton(): void {
    const isValid = Object.values(validationState).every((state: boolean) => state);
    submitBtn.disabled = !isValid;
}

// 文字数カウントの更新
function updateCharCount(): void {
    const count = message.value.length;
    charCount.textContent = count.toString();
}



// 確認画面の表示
function showConfirmScreen(): void {
    const formData = {
        prefecture: prefecture.options[prefecture.selectedIndex]?.text || '',
        gender: Array.from(genderInputs).find(input => input.checked)?.value || '',
        lastName: lastName.value,
        firstName: firstName.value,
        lastNameKana: lastNameKana.value,
        firstNameKana: firstNameKana.value,
        phone: phone.value,
        email: email.value,
        message: message.value
    };

    const genderText = {
        male: '男性',
        female: '女性',
        other: 'その他'
    };

    confirmContent.innerHTML = `
        <div class="confirm-item">
            <div class="confirm-label">都道府県:</div>
            <div class="confirm-value">${formData.prefecture}</div>
        </div>
        <div class="confirm-item">
            <div class="confirm-label">性別:</div>
            <div class="confirm-value">${genderText[formData.gender as keyof typeof genderText] || ''}</div>
        </div>
        <div class="confirm-item">
            <div class="confirm-label">氏名:</div>
            <div class="confirm-value">${formData.lastName} ${formData.firstName}</div>
        </div>
        <div class="confirm-item">
            <div class="confirm-label">フリガナ:</div>
            <div class="confirm-value">${formData.lastNameKana} ${formData.firstNameKana}</div>
        </div>
        <div class="confirm-item">
            <div class="confirm-label">電話番号:</div>
            <div class="confirm-value">${formData.phone}</div>
        </div>
        <div class="confirm-item">
            <div class="confirm-label">メールアドレス:</div>
            <div class="confirm-value">${formData.email}</div>
        </div>
        <div class="confirm-item">
            <div class="confirm-label">メッセージ:</div>
            <div class="confirm-value">${formData.message || '未入力'}</div>
        </div>
    `;

    form.style.display = 'none';
    confirmScreen.style.display = 'block';
}

// フォーム画面に戻る
function backToForm(): void {
    confirmScreen.style.display = 'none';
    form.style.display = 'block';
}

// 送信完了
function completeSubmission(): void {
    alert('送信が完了しました！');
    // フォームをリセット
    form.reset();
    Object.keys(validationState).forEach(key => {
        validationState[key as keyof ValidationState] = false;
    });
    updateSubmitButton();
    updateCharCount();
    backToForm();
}

// イベントリスナーの設定
prefecture.addEventListener('change', () => {
    validatePrefecture();
    updateSubmitButton();
});

genderInputs.forEach(input => {
    input.addEventListener('change', () => {
        validateGender();
        updateSubmitButton();
    });
});


// カタカナフィールドの手動入力時のバリデーション
lastNameKana.addEventListener('input', () => {
    validateKana(lastNameKana.value, 'lastNameKana');
    updateSubmitButton();
});

firstNameKana.addEventListener('input', () => {
    validateKana(firstNameKana.value, 'firstNameKana');
    updateSubmitButton();
});

// カタカナフィールドのフォーカスアウト時のバリデーション
lastNameKana.addEventListener('blur', () => {
    validateKana(lastNameKana.value, 'lastNameKana');
    updateSubmitButton();
});

firstNameKana.addEventListener('blur', () => {
    validateKana(firstNameKana.value, 'firstNameKana');
    updateSubmitButton();
});


phone.addEventListener('input', () => {
    // 数字以外の文字を除去
    phone.value = phone.value.replace(/[^\d]/g, '');
    validatePhone();
    updateSubmitButton();
});

email.addEventListener('blur', () => {
    validateEmail();
    updateSubmitButton();
});

message.addEventListener('input', updateCharCount);

// フォーカスアウト時のバリデーション
prefecture.addEventListener('blur', () => {
    validatePrefecture();
    updateSubmitButton();
});

lastName.addEventListener('blur', async () => {
    validateName(lastName.value, 'lastName');

    // フォーカスアウト時にカタカナ変換を実行
    if (lastName.value.trim()) {
        // 高度な変換機能を使用
        const kana = await convertToKanaWithAdvanced(lastName.value);

        // カタカナフィールドが空の場合のみ自動入力
        if (lastNameKana.value.trim() === '') {
            lastNameKana.value = kana;
            validateKana(kana, 'lastNameKana');
        }
    } else {
        // 入力が空の場合はカタカナフィールドもクリア
        lastNameKana.value = '';
        clearError('lastNameKana');
        validationState.lastNameKana = false;
    }

    updateSubmitButton();
});

// lastNameの入力中にテキストが消された場合の処理
lastName.addEventListener('input', () => {
    // 入力が空になった場合、カタカナフィールドもクリア
    if (!lastName.value.trim()) {
        lastNameKana.value = '';
        clearError('lastNameKana');
        validationState.lastNameKana = false;
    }
    validateName(lastName.value, 'lastName');
    updateSubmitButton();
});

firstName.addEventListener('blur', async () => {
    validateName(firstName.value, 'firstName');

    // フォーカスアウト時にカタカナ変換を実行
    if (firstName.value.trim()) {
        // 高度な変換機能を使用
        const kana = await convertToKanaWithAdvanced(firstName.value);

        // カタカナフィールドが空の場合のみ自動入力
        if (firstNameKana.value.trim() === '') {
            firstNameKana.value = kana;
            validateKana(kana, 'firstNameKana');
        }
    } else {
        // 入力が空の場合はカタカナフィールドもクリア
        firstNameKana.value = '';
        clearError('firstNameKana');
        validationState.firstNameKana = false;
    }

    updateSubmitButton();
});

// firstNameの入力中にテキストが消された場合の処理
firstName.addEventListener('input', () => {
    // 入力が空になった場合、カタカナフィールドもクリア
    if (!firstName.value.trim()) {
        firstNameKana.value = '';
        clearError('firstNameKana');
        validationState.firstNameKana = false;
    }
    validateName(firstName.value, 'firstName');
    updateSubmitButton();
});

phone.addEventListener('blur', () => {
    validatePhone();
    updateSubmitButton();
});

// フォーム送信
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 全項目のバリデーション
    const isPrefectureValid = validatePrefecture();
    const isGenderValid = validateGender();
    const isLastNameValid = validateName(lastName.value, 'lastName');
    const isFirstNameValid = validateName(firstName.value, 'firstName');
    const isLastNameKanaValid = validateKana(lastNameKana.value, 'lastNameKana');
    const isFirstNameKanaValid = validateKana(firstNameKana.value, 'firstNameKana');
    const isPhoneValid = validatePhone();
    const isEmailValid = validateEmail();

    if (isPrefectureValid && isGenderValid && isLastNameValid && isFirstNameValid &&
        isLastNameKanaValid && isFirstNameKanaValid && isPhoneValid && isEmailValid) {
        showConfirmScreen();
    }
});


backBtn.addEventListener('click', backToForm);
completeBtn.addEventListener('click', completeSubmission);

// Wanakanaの読み込み完了を待ってからアプリケーションを初期化
waitForWanakana().then(async (wanakanaLoaded) => {
    if (!wanakanaLoaded) {
        console.warn('⚠️ Wanakana not available, continuing with limited functionality...');
    }

    // Kuromoji.jsの初期化
    try {
        await initializeAdvancedConverter();

        // Yahoo! APIのテスト
        await testYahooApiConnection();

        // APIキーの状態を表示
        validateApiKey();
        getMaskedApiKey();

    } catch (error) {
        console.error('❌ Advanced converter initialization failed:', error);
    }

    // アプリケーションの初期化
    updateSubmitButton();
    updateCharCount();
}).catch((error) => {
    console.error('❌ Error during Wanakana loading:', error);
    // エラーが発生してもアプリケーションは継続
    updateSubmitButton();
    updateCharCount();
});

}); // DOMContentLoaded の終了
