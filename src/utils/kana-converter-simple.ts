// シンプルなカタカナ変換機能
import { KanaConversionResult } from '../types';

// Wanakanaライブラリの型定義
declare global {
    interface Window {
        wanakana: any;
    }
}

// ひらがな→カタカナの基本変換
export function convertToKanaBasic(text: string): string {
    if (!text) return '';
    return text.replace(/[\u3041-\u3096]/g, function(match) {
        return String.fromCharCode(match.charCodeAt(0) + 0x60);
    });
}

// Wanakanaライブラリを使用した変換
export function convertWithWanakana(text: string): KanaConversionResult {
    if (!text) return { success: false, result: '', method: 'none' };

    console.log('=== convertWithWanakana called ===');
    console.log('Input text:', text);

    if (typeof window !== 'undefined' && window.wanakana) {
        try {
            // Wanakanaで漢字・ひらがなをカタカナに変換
            const katakana = window.wanakana.toKatakana(text);

            if (katakana && katakana !== text && katakana.length > 0) {
                console.log('✅ Wanakana conversion successful:', text, '->', katakana);
                return { success: true, result: katakana, method: 'wanakana' };
            } else {
                console.warn('⚠️ Wanakana returned invalid result:', katakana);
            }
        } catch (error) {
            console.error('❌ Wanakana conversion error:', error);
            return { success: false, result: '', method: 'wanakana', error: (error as Error).message };
        }
    } else {
        console.warn('⚠️ Wanakana library not available');
    }

    return { success: false, result: '', method: 'wanakana' };
}

// 漢字辞書を使用した変換
export function convertWithKanjiDictionary(text: string): KanaConversionResult {
    if (!text) return { success: false, result: '', method: 'none' };

    console.log('=== convertWithKanjiDictionary called ===');
    console.log('Input text:', text);

    // 最小限の漢字辞書
    const kanjiDictionary: { [key: string]: string } = {
        '田中': 'タナカ',
        '岩埼': 'イワサキ',
        '佐藤': 'サトウ',
        '山田': 'ヤマダ',
        '鈴木': 'スズキ',
        '高橋': 'タカハシ',
        '渡辺': 'ワタナベ',
        '伊藤': 'イトウ',
        '中村': 'ナカムラ',
        '小林': 'コバヤシ',
        '加藤': 'カトウ',
        '吉田': 'ヨシダ',
        '山本': 'ヤマモト',
        '松本': 'マツモト',
        '井上': 'イノウエ',
        '木村': 'キムラ',
        '林': 'ハヤシ',
        '清水': 'シミズ',
        '森': 'モリ',
        '池田': 'イケダ',
        '橋本': 'ハシモト',
        '斎藤': 'サイトウ',
        '石川': 'イシカワ',
        '阿部': 'アベ',
        '藤田': 'フジタ',
        '岡田': 'オカダ',
        '中島': 'ナカジマ',
        '藤井': 'フジイ',
        '田村': 'タムラ',
        '原田': 'ハラダ',
        '前田': 'マエダ',
        '上田': 'ウエダ',
        '長谷川': 'ハセガワ',
        '村上': 'ムラカミ',
        '近藤': 'コンドウ',
        '石井': 'イシイ',
        '斉藤': 'サイトウ',
        '坂本': 'サカモト',
        '遠藤': 'エンドウ',
        '青木': 'アオキ',
        '藤本': 'フジモト',
        '西村': 'ニシムラ',
        '福田': 'フクダ',
        '太田': 'オオタ',
        '三浦': 'ミウラ',
        '岡本': 'オカモト',
        '松田': 'マツダ',
        '中川': 'ナカガワ',
        '中野': 'ナカノ',
        '原': 'ハラ',
        '竹内': 'タケウチ',
        '小川': 'オガワ',
        '田辺': 'タナベ',
        '森田': 'モリタ',
        '土屋': 'ツチヤ',
        '上野': 'ウエノ',
        '酒井': 'サカイ',
        '武田': 'タケダ',
        '柴田': 'シバタ',
        '新井': 'アライ',
        '杉山': 'スギヤマ',
        '古川': 'フルカワ',
        '大野': 'オオノ',
        '松井': 'マツイ',
        '千葉': 'チバ',
        '岩田': 'イワタ',
        '菊地': 'キクチ',
        '久保': 'クボ',
        '佐々木': 'ササキ',
        '横山': 'ヨコヤマ',
        '安田': 'ヤスダ',
        '内田': 'ウチダ',
        '平野': 'ヒラノ',
        '藤原': 'フジワラ',
        '福島': 'フクシマ',
        '西田': 'ニシダ',
        '丸山': 'マルヤマ',
        '今井': 'イマイ',
        '河野': 'コウノ',
        '上原': 'ウエハラ',
        '石田': 'イシダ',
        '小島': 'コジマ',
        '小山': 'コヤマ',
        '高田': 'タカダ',
        '大塚': 'オオツカ',
        '平田': 'ヒラタ',
        '工藤': 'クドウ',
        '宮崎': 'ミヤザキ',
        '星野': 'ホシノ',
        '谷口': 'タニグチ',
        '大西': 'オオニシ',
        '小松': 'コマツ',
        '野口': 'ノグチ',
        '水野': 'ミズノ',
        '高木': 'タカギ',
        '吉川': 'ヨシカワ',
        '山崎': 'ヤマザキ',
        '森本': 'モリモト',
        '石原': 'イシハラ',
        '中尾': 'ナカオ',
        '上村': 'ウエムラ',
        '江藤': 'エトウ',
        '宮田': 'ミヤタ',
        '大谷': 'オオタニ',
        '小田': 'オダ',
        '松尾': 'マツオ',
        '菊川': 'キクガワ',
        '野村': 'ノムラ',
        '松岡': 'マツオカ',
        '小野': 'オノ',
        '田島': 'タジマ',
        '藤川': 'フジカワ',
        '西川': 'ニシカワ',
        '村田': 'ムラタ',
        '永井': 'ナガイ',
        '松浦': 'マツウラ',
        '荒木': 'アラキ',
        '大内': 'オオウチ',
        '小西': 'コニシ',
        '三宅': 'ミヤケ',
        '松原': 'マツバラ',
        '古田': 'フルタ',
        '野田': 'ノダ',
        '松村': 'マツムラ',
        '小泉': 'コイズミ',
        '大橋': 'オオハシ',
        '小沢': 'オザワ',
        '小野寺': 'オノデラ'
    };

    // 辞書から検索
    const result = kanjiDictionary[text] || convertToKanaBasic(text);

    console.log('Dictionary conversion result:', text, '->', result);
    return { success: true, result, method: 'dictionary' };
}

// 統合された変換関数
export function convertToKana(text: string): KanaConversionResult {
    if (!text.trim()) return { success: false, result: '', method: 'none' };

    console.log('=== Kana Conversion ===');
    console.log('Input text:', text);

    // 1. Wanakanaを試行
    const wanakanaResult = convertWithWanakana(text);
    if (wanakanaResult.success && wanakanaResult.result !== text) {
        console.log('✅ Wanakana conversion successful:', text, '->', wanakanaResult.result);
        return wanakanaResult;
    }

    // 2. 漢字辞書を試行
    const dictionaryResult = convertWithKanjiDictionary(text);
    if (dictionaryResult.success && dictionaryResult.result !== text) {
        console.log('✅ Dictionary conversion successful:', text, '->', dictionaryResult.result);
        return dictionaryResult;
    }

    // 3. フォールバック: 基本変換
    const fallbackResult = convertToKanaBasic(text);
    console.log('⚠️ Using basic fallback:', text, '->', fallbackResult);
    return { success: true, result: fallbackResult, method: 'basic' };
}
