// フォーム管理機能
import { FormElements, FormData, GenderText, ValidationState } from '../types';
import { validateAllFields } from './validation';

// 性別のテキストマッピング
const genderText: GenderText = {
    male: '男性',
    female: '女性',
    other: 'その他'
};

// フォーム要素の取得
export function getFormElements(): FormElements {
    return {
        form: document.getElementById('userForm') as HTMLFormElement,
        submitBtn: document.getElementById('submitBtn') as HTMLButtonElement,
        confirmScreen: document.getElementById('confirmScreen') as HTMLDivElement,
        confirmContent: document.getElementById('confirmContent') as HTMLDivElement,
        backBtn: document.getElementById('backBtn') as HTMLButtonElement,
        completeBtn: document.getElementById('completeBtn') as HTMLButtonElement,
        prefecture: document.getElementById('prefecture') as HTMLSelectElement,
        genderInputs: document.querySelectorAll('input[name="gender"]') as NodeListOf<HTMLInputElement>,
        lastName: document.getElementById('lastName') as HTMLInputElement,
        firstName: document.getElementById('firstName') as HTMLInputElement,
        lastNameKana: document.getElementById('lastNameKana') as HTMLInputElement,
        firstNameKana: document.getElementById('firstNameKana') as HTMLInputElement,
        phone: document.getElementById('phone') as HTMLInputElement,
        email: document.getElementById('email') as HTMLInputElement,
        message: document.getElementById('message') as HTMLTextAreaElement,
        charCount: document.getElementById('charCount') as HTMLSpanElement
    };
}

// 送信ボタンの有効/無効を切り替え
export function updateSubmitButton(validationState: ValidationState, submitBtn: HTMLButtonElement): void {
    const isValid = Object.values(validationState).every((state: boolean) => state);
    console.log('Validation state:', validationState);
    console.log('All fields valid:', isValid);
    submitBtn.disabled = !isValid;
}

// 文字数カウントの更新
export function updateCharCount(message: HTMLTextAreaElement, charCount: HTMLSpanElement): void {
    const count = message.value.length;
    charCount.textContent = count.toString();
}

// フォームデータの取得
export function getFormData(elements: FormElements): FormData {
    return {
        prefecture: elements.prefecture.options[elements.prefecture.selectedIndex]?.text || '',
        gender: Array.from(elements.genderInputs).find(input => input.checked)?.value || '',
        lastName: elements.lastName.value,
        firstName: elements.firstName.value,
        lastNameKana: elements.lastNameKana.value,
        firstNameKana: elements.firstNameKana.value,
        phone: elements.phone.value,
        email: elements.email.value,
        message: elements.message.value
    };
}

// 確認画面の表示
export function showConfirmScreen(elements: FormElements): void {
    const formData = getFormData(elements);

    elements.confirmContent.innerHTML = `
        <div class="confirm-item">
            <div class="confirm-label">都道府県:</div>
            <div class="confirm-value">${formData.prefecture}</div>
        </div>
        <div class="confirm-item">
            <div class="confirm-label">性別:</div>
            <div class="confirm-value">${genderText[formData.gender as keyof GenderText] || ''}</div>
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

    elements.form.style.display = 'none';
    elements.confirmScreen.style.display = 'block';
}

// フォーム画面に戻る
export function backToForm(elements: FormElements): void {
    elements.confirmScreen.style.display = 'none';
    elements.form.style.display = 'block';
}

// 送信完了
export function completeSubmission(elements: FormElements, validationState: ValidationState): void {
    alert('送信が完了しました！');
    // フォームをリセット
    elements.form.reset();
    Object.keys(validationState).forEach(key => {
        validationState[key as keyof ValidationState] = false;
    });
    updateSubmitButton(validationState, elements.submitBtn);
    updateCharCount(elements.message, elements.charCount);
    backToForm(elements);
}

// フォーム送信処理
export function handleFormSubmit(elements: FormElements): void {
    if (validateAllFields(elements)) {
        showConfirmScreen(elements);
    }
}
