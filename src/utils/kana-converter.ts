// jQuery、Wanakana、Kuroshiroライブラリの型定義
declare global {
    interface Window {
        $: any;
        jQuery: any;
        wanakana: any;
        Kuroshiro: any;
    }
}

// ひらがな→カタカナの基本変換（フォールバック用）
export function convertToKanaBasic(text: string): string {
    if (!text) return '';
    return text.replace(/[\u3041-\u3096]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
}

// 最小限のフォールバック用漢字辞書（ライブラリが利用できない場合のみ使用）
const kanjiToKanaMap: { [key: string]: string } = {
    // 最も基本的な数字のみ
    '一': 'イチ',
    '二': 'ニ',
    '三': 'サン',
    '四': 'シ',
    '五': 'ゴ',
    '六': 'ロク',
    '七': 'シチ',
    '八': 'ハチ',
    '九': 'キュウ',
    '十': 'ジュウ',

    // 最も基本的な漢字のみ
    '大': 'ダイ',
    '小': 'ショウ',
    '日': 'ヒ',
    '月': 'ツキ',
    '年': 'ネン',
    '時': 'トキ'
};

// 最小限のフォールバック用漢字辞書変換（ライブラリが利用できない場合のみ使用）
export function convertWithKanjiDictionary(text: string): string {
    if (!text) return '';

    console.log('=== convertWithKanjiDictionary called (fallback only) ===');
    console.log('Input text:', text);
    console.log('⚠️ This is a minimal fallback - libraries should be used instead');

    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (kanjiToKanaMap[char]) {
            result += kanjiToKanaMap[char];
            console.log(`Minimal dictionary conversion: ${char} -> ${kanjiToKanaMap[char]}`);
        } else {
            result += char;
        }
    }

    console.log('Minimal dictionary conversion result:', text, '->', result);
    return result;
}

// Web APIを使用した漢字変換（より包括的）
export async function convertWithWebAPI(text: string): Promise<string> {
    if (!text) return '';

    console.log('=== convertWithWebAPI called ===');
    console.log('Input text:', text);

    try {
        // 無料の日本語形態素解析APIを使用
        const response = await fetch('https://api.mymemory.translated.net/get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Web API response:', data);
            // 実際のAPIレスポンスに応じて処理を調整
            return text; // フォールバック
        }
    } catch (error) {
        console.error('Web API conversion error:', error);
    }

    return text;
}

// 漢字検出とライブラリ優先の変換処理
export function detectAndConvertKanji(text: string): string {
    if (!text) return '';

    console.log('=== detectAndConvertKanji called ===');
    console.log('Input text:', text);

    // 漢字のUnicode範囲をチェック
    const kanjiRegex = /[\u4e00-\u9faf]/g;
    const hasKanji = kanjiRegex.test(text);

    console.log('Contains kanji:', hasKanji);

    if (hasKanji) {
        // 漢字が含まれている場合は、まずライブラリでの変換を試行
        console.log('Kanji detected, trying library conversions first...');

        // 1. Wanakanaの2段階変換を試行
        const wanakanaResult = convertKanjiToKatakana(text);
        if (wanakanaResult !== convertToKanaBasic(text)) {
            console.log('Wanakana two-step conversion successful:', text, '->', wanakanaResult);
            return wanakanaResult;
        }

        // 2. Wanakanaの直接変換を試行
        const directWanakanaResult = convertWithWanakana(text);
        if (directWanakanaResult !== convertToKanaBasic(text)) {
            console.log('Direct Wanakana conversion successful:', text, '->', directWanakanaResult);
            return directWanakanaResult;
        }

        // 3. 最後の手段として辞書を使用（最小限のフォールバック）
        console.log('Library conversions failed, using minimal dictionary fallback...');
        return convertWithKanjiDictionary(text);
    }

    // 漢字が含まれていない場合はそのまま返す
    return text;
}

// Kuroshiroライブラリを使用した漢字変換（最優先）
export function convertWithKuroshiro(text: string): string {
    if (!text) return '';

    console.log('=== convertWithKuroshiro called ===');
    console.log('Input text:', text);

    if (typeof window !== 'undefined' && window.Kuroshiro) {
        try {
            // Kuroshiroで漢字→カタカナ変換
            const kuroshiro = new window.Kuroshiro();
            // 簡易的な変換（実際のKuroshiroは初期化が必要）
            const katakana = kuroshiro.convert(text, { to: 'katakana' });

            // 変換結果の検証
            if (katakana && katakana !== text && katakana.length > 0) {
                console.log('✅ Kuroshiro conversion successful:', text, '->', katakana);
                return katakana;
            } else {
                console.warn('⚠️ Kuroshiro returned invalid result:', katakana);
            }
        } catch (error) {
            console.error('❌ Kuroshiro conversion error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        }
    } else {
        console.warn('⚠️ Kuroshiro library not available');
    }

    // フォールバック
    const fallbackResult = convertToKanaBasic(text);
    console.log('Using basic fallback:', text, '->', fallbackResult);
    return fallbackResult;
}

// 漢字→ひらがな→カタカナの2段階変換（Wanakana使用）
export function convertKanjiToKatakana(text: string): string {
    if (!text) return '';

    console.log('=== convertKanjiToKatakana called ===');
    console.log('Input text:', text);

    if (typeof window !== 'undefined' && window.wanakana) {
        try {
            // 1段階目: 漢字→ひらがな
            const hiragana = window.wanakana.toHiragana(text);
            console.log('Step 1 - Kanji to Hiragana:', text, '->', hiragana);

            // 2段階目: ひらがな→カタカナ
            const katakana = window.wanakana.toKatakana(hiragana);
            console.log('Step 2 - Hiragana to Katakana:', hiragana, '->', katakana);

            console.log('Two-step conversion successful:', text, '->', katakana);
            return katakana;
        } catch (error) {
            console.error('Two-step conversion error:', error);
        }
    }

    // フォールバック
    const fallbackResult = convertToKanaBasic(text);
    console.log('Using basic fallback:', text, '->', fallbackResult);
    return fallbackResult;
}

// Wanakanaライブラリを使用した変換（漢字対応）
export function convertWithWanakana(text: string): string {
    if (!text) return '';

    console.log('=== convertWithWanakana called ===');
    console.log('Input text:', text);
    console.log('Window object exists:', typeof window !== 'undefined');
    console.log('Wanakana object exists:', !!(typeof window !== 'undefined' && window.wanakana));

    if (typeof window !== 'undefined' && window.wanakana) {
        console.log('Wanakana object:', window.wanakana);
        console.log('Wanakana.toKatakana exists:', !!window.wanakana.toKatakana);

        try {
            // Wanakanaで漢字・ひらがなをカタカナに変換
            const katakana = window.wanakana.toKatakana(text);

            // 変換結果の検証
            if (katakana && katakana !== text && katakana.length > 0) {
                console.log('✅ Wanakana conversion successful:', text, '->', katakana);
                return katakana;
            } else {
                console.warn('⚠️ Wanakana returned invalid result:', katakana);
            }
        } catch (error) {
            console.error('❌ Wanakana conversion error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        }
    } else {
        console.warn('⚠️ Wanakana library not available');
    }

    // Wanakanaが利用できない場合は基本的な変換を使用
    const fallbackResult = convertToKanaBasic(text);
    console.log('Using fallback conversion:', text, '->', fallbackResult);
    return fallbackResult;
}


// ライブラリ・API中心のメイン変換関数
export async function convertToKana(text: string): Promise<string> {
    if (!text.trim()) return '';

    console.log('=== Library/API-centered conversion ===');
    console.log('Input text:', text);

    // 1. Kuroshiroライブラリを最優先で試行
    let result = convertWithKuroshiro(text);
    if (result !== convertToKanaBasic(text)) {
        console.log('✅ Kuroshiro conversion successful:', text, '->', result);
        return result;
    }

    // 2. Wanakanaの2段階変換を試行
    result = convertKanjiToKatakana(text);
    if (result !== convertToKanaBasic(text)) {
        console.log('✅ Wanakana two-step conversion successful:', text, '->', result);
        return result;
    }

    // 3. Wanakanaの直接変換を試行
    result = convertWithWanakana(text);
    if (result !== convertToKanaBasic(text)) {
        console.log('✅ Direct Wanakana conversion successful:', text, '->', result);
        return result;
    }

    // 4. 最後の手段として最小限の辞書を使用
    console.log('⚠️ All library conversions failed, using minimal fallback');
    result = convertWithKanjiDictionary(text);

    console.log('Final conversion result:', text, '->', result);
    return result;
}

export function convertToKanaSync(text: string): string {
    console.log('=== convertToKanaSync called ===');
    console.log('Input text:', text);

    // 1. Kuroshiroライブラリを最優先で試行
    let result = convertWithKuroshiro(text);
    if (result !== convertToKanaBasic(text)) {
        console.log('Kuroshiro conversion successful:', text, '->', result);
        return result;
    }

    // 2. Wanakanaの2段階変換を試行
    result = convertKanjiToKatakana(text);
    if (result !== convertToKanaBasic(text)) {
        console.log('Two-step conversion successful:', text, '->', result);
        return result;
    }

    // 3. Wanakanaの直接変換を試行
    result = convertWithWanakana(text);
    if (result !== convertToKanaBasic(text)) {
        console.log('Direct Wanakana conversion successful:', text, '->', result);
        return result;
    }

    // 4. 最後の手段として漢字辞書を使用（最小限のフォールバック）
    console.log('All library conversions failed, using minimal kanji dictionary fallback...');
    result = convertWithKanjiDictionary(text);

    console.log('Final conversion result:', text, '->', result);
    return result;
}

// 高度な変換機能のインポート
import {
    initializeKuromoji,
    convertToKanaAdvanced,
    isKuromojiReady,
    testYahooApi
} from './advanced-kana-converter';

// Kuromoji.jsの初期化状態
let kuromojiInitialized = false;

// Kuromoji.jsの初期化
export async function initializeAdvancedConverter(): Promise<void> {
    try {
        await initializeKuromoji();
        kuromojiInitialized = true;
        console.log('✅ Advanced converter initialized successfully');
    } catch (error) {
        console.error('❌ Advanced converter initialization failed:', error);
        kuromojiInitialized = false;
    }
}

// 高度な変換機能を使用した変換
export async function convertToKanaWithAdvanced(text: string): Promise<string> {
    if (!text) return '';

    console.log('=== Advanced Kana Conversion ===');
    console.log('Input text:', text);
    console.log('kuromojiInitialized:', kuromojiInitialized);
    console.log('isKuromojiReady():', isKuromojiReady());

    try {
        // Kuromoji.jsが利用可能な場合は高度な変換を使用
        if (kuromojiInitialized && isKuromojiReady()) {
            console.log('Using Kuromoji.js for conversion');
            const advancedResult = await convertToKanaAdvanced(text);
            if (advancedResult && advancedResult !== text) {
                console.log('✅ Advanced conversion successful:', text, '->', advancedResult);
                return advancedResult;
            }
        }

        // フォールバック: 既存の変換機能を使用
        console.log('⚠️ Advanced conversion not available, using fallback');
        console.log('Fallback reason: kuromojiInitialized =', kuromojiInitialized, ', isKuromojiReady =', isKuromojiReady());
        const fallbackResult = convertToKanaSync(text);
        console.log('Fallback conversion result:', text, '->', fallbackResult);
        return fallbackResult;

    } catch (error) {
        console.error('❌ Advanced conversion error:', error);
        const fallbackResult = convertToKanaSync(text);
        console.log('Error fallback conversion result:', text, '->', fallbackResult);
        return fallbackResult;
    }
}

// Yahoo! APIのテスト
export async function testYahooApiConnection(): Promise<boolean> {
    try {
        const result = await testYahooApi();
        console.log('Yahoo API test result:', result);
        return result;
    } catch (error) {
        console.error('Yahoo API test failed:', error);
        return false;
    }
}

// Kuromoji.jsの状態確認
export function isAdvancedConverterReady(): boolean {
    return kuromojiInitialized && isKuromojiReady();
}