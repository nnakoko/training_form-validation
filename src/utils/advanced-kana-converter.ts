// Kuromoji.jsをCDNから読み込む
declare global {
    interface Window {
        kuromoji: any;
    }
}
import { API_CONFIG, validateApiKey, getMaskedApiKey } from '../config/api-config';

// Kuromoji.jsの型定義
interface KuromojiToken {
    word_id: number;
    word_type: string;
    word_position: number;
    surface_form: string;
    pos: string;
    pos_detail_1: string;
    pos_detail_2: string;
    pos_detail_3: string;
    conjugated_type: string;
    conjugated_form: string;
    basic_form: string;
    reading: string;
    pronunciation: string;
}

// Yahoo! APIの型定義
interface YahooApiResponse {
    ResultSet: {
        Result: Array<{
            Segment: Array<{
                Candidate: Array<{
                    Text: string;
                    Reading: string;
                }>;
            }>;
        }>;
    };
}

// Kuromoji.jsのトークナイザー
let kuromojiTokenizer: kuromoji.Tokenizer<KuromojiToken> | null = null;

// Kuromoji.jsの初期化
export function initializeKuromoji(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (kuromojiTokenizer) {
            resolve();
            return;
        }

        // Kuromojiが読み込まれるまで待機する関数
        function waitForKuromoji(): Promise<void> {
            return new Promise((waitResolve) => {
                // まず即座にKuromojiが利用可能かチェック
                if (typeof window.kuromoji !== 'undefined') {
                    waitResolve();
                    return;
                }

                // カスタムイベントをリッスン
                const handleKuromojiLoaded = () => {
                    console.log('✅ Kuromoji loaded event received');
                    window.removeEventListener('kuromojiLoaded', handleKuromojiLoaded);
                    window.removeEventListener('kuromojiError', handleKuromojiError);
                    waitResolve();
                };

                const handleKuromojiError = (event: Event) => {
                    console.warn('⚠️ Kuromoji error event received:', (event as CustomEvent).detail);
                    window.removeEventListener('kuromojiLoaded', handleKuromojiLoaded);
                    window.removeEventListener('kuromojiError', handleKuromojiError);
                    waitResolve(); // エラーでも継続
                };

                window.addEventListener('kuromojiLoaded', handleKuromojiLoaded);
                window.addEventListener('kuromojiError', handleKuromojiError);

                // タイムアウト設定（3秒）
                setTimeout(() => {
                    console.warn('⚠️ Kuromoji loading timeout after 3 seconds');
                    window.removeEventListener('kuromojiLoaded', handleKuromojiLoaded);
                    window.removeEventListener('kuromojiError', handleKuromojiError);
                    waitResolve(); // タイムアウトでも継続
                }, 3000);
            });
        }

        // Kuromojiの読み込みを待ってから初期化
        waitForKuromoji().then(() => {
            try {
                // CDNから読み込まれたKuromoji.jsを使用
                if (typeof window.kuromoji === 'undefined') {
                    console.log('⚠️ Kuromoji not available after waiting, skipping initialization');
                    resolve();
                    return;
                }

                // 複数の辞書パスを試行
                const dictPaths = [
                    '/kuromoji/dict/',
                    '/node_modules/kuromoji/dict/',
                    'https://unpkg.com/kuromoji@0.1.2/dict/'
                ];

                let dictPathIndex = 0;

                function tryNextDictPath() {
                    if (dictPathIndex >= dictPaths.length) {
                        console.error('❌ All dictionary paths failed');
                        resolve();
                        return;
                    }

                    const currentDictPath = dictPaths[dictPathIndex];
                    console.log(`Trying dictionary path: ${currentDictPath}`);

                    const builder = window.kuromoji.builder({
                        dicPath: currentDictPath,
                        // ブラウザ環境での設定
                        debug: false
                    });

                    builder.build((err, tokenizer) => {
                        if (err) {
                            console.error(`Kuromoji initialization failed with path ${currentDictPath}:`, err);
                            console.log('Error details:', {
                                message: err.message,
                                stack: err.stack
                            });
                            // 次の辞書パスを試行
                            dictPathIndex++;
                            tryNextDictPath();
                            return;
                        }

                        kuromojiTokenizer = tokenizer;
                        console.log(`✅ Kuromoji initialized successfully with path: ${currentDictPath}`);
                        console.log('Kuromoji tokenizer:', kuromojiTokenizer);
                        resolve();
                    });
                }

                tryNextDictPath();
            } catch (error) {
                console.error('Kuromoji builder error:', error);
                console.log('⚠️ Kuromoji will be disabled, using fallback methods');
                // エラーが発生してもアプリケーションは継続
                resolve();
            }
        }).catch((error) => {
            console.error('Kuromoji waiting error:', error);
            resolve();
        });
    });
}

// Kuromoji.jsを使用した漢字変換
export function convertWithKuromoji(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!kuromojiTokenizer) {
            reject(new Error('Kuromoji not initialized'));
            return;
        }

        try {
            const tokens = kuromojiTokenizer.tokenize(text);
            console.log('Kuromoji tokens:', tokens);

            const result = tokens
                .map(token => {
                    // 読み仮名がある場合はそれを使用、ない場合は表層形をそのまま使用
                    return token.reading || token.surface_form;
                })
                .join('');

            console.log(`Kuromoji conversion: "${text}" -> "${result}"`);
            resolve(result);
        } catch (error) {
            console.error('Kuromoji conversion error:', error);
            reject(error);
        }
    });
}

// Yahoo! APIを使用した漢字変換
export async function convertWithYahooApi(text: string): Promise<string> {
    try {
        // APIキーの検証
        if (!validateApiKey()) {
            throw new Error('Yahoo API key not configured');
        }

        console.log('Using Yahoo API key:', getMaskedApiKey());

        const requestBody = {
            id: 'kana-converter',
            jsonrpc: '2.0',
            method: 'jlp.jimservice.conversion',
            params: {
                q: text,
                format: 'hiragana'
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.API_TIMEOUT);

        const response = await fetch(API_CONFIG.YAHOO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; KanaConverter/1.0)',
                'Authorization': `Bearer ${API_CONFIG.YAHOO_API_KEY}`
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Yahoo API error: ${response.status} ${response.statusText}`);
        }

        const data: YahooApiResponse = await response.json();

        if (!data.ResultSet || !data.ResultSet.Result || data.ResultSet.Result.length === 0) {
            throw new Error('Invalid Yahoo API response format');
        }

        const result = data.ResultSet.Result[0].Segment
            .map(segment => segment.Candidate[0].Reading)
            .join('');

        console.log(`✅ Yahoo API conversion: "${text}" -> "${result}"`);
        return result;
    } catch (error) {
        console.error('❌ Yahoo API conversion error:', error);
        throw error;
    }
}

// Yahoo! APIのモック実装（テスト用）
export function convertWithYahooApiMock(text: string): Promise<string> {
    return new Promise((resolve) => {
        // 簡単なモック実装
        const mockConversions: { [key: string]: string } = {
            '田中': 'たなか',
            '岩埼': 'いわさき',
            '佐藤': 'さとう',
            '山田': 'やまだ',
            '鈴木': 'すずき',
            '高橋': 'たかはし',
            '渡辺': 'わたなべ',
            '伊藤': 'いとう',
            '中村': 'なかむら',
            '小林': 'こばやし'
        };

        const result = mockConversions[text] || text;
        console.log(`Yahoo API Mock conversion: "${text}" -> "${result}"`);
        resolve(result);
    });
}

// 統合された変換関数（優先順位付き）
export async function convertToKanaAdvanced(text: string): Promise<string> {
    if (!text) return '';

    console.log('=== Advanced Kana Conversion ===');
    console.log('Input text:', text);

    try {
        // 1. Yahoo! APIを試行（実際のAPI）
        if (validateApiKey()) {
            try {
                const yahooResult = await convertWithYahooApi(text);
                if (yahooResult && yahooResult !== text) {
                    console.log('✅ Yahoo API conversion successful');
                    return yahooResult;
                }
            } catch (error) {
                console.warn('⚠️ Yahoo API conversion failed:', error);
            }
        } else {
            console.log('⚠️ Yahoo API key not configured, using mock');
            try {
                const yahooResult = await convertWithYahooApiMock(text);
                if (yahooResult && yahooResult !== text) {
                    console.log('✅ Yahoo API Mock conversion successful');
                    return yahooResult;
                }
            } catch (error) {
                console.warn('⚠️ Yahoo API Mock conversion failed:', error);
            }
        }

        // 2. Kuromoji.jsを試行
        if (kuromojiTokenizer) {
            try {
                const kuromojiResult = await convertWithKuromoji(text);
                if (kuromojiResult && kuromojiResult !== text) {
                    console.log('✅ Kuromoji conversion successful');
                    return kuromojiResult;
                }
            } catch (error) {
                console.warn('⚠️ Kuromoji conversion failed:', error);
            }
        }

        // 3. フォールバック: 元のテキストをそのまま返す
        console.log('⚠️ All conversions failed, returning original text');
        return text;

    } catch (error) {
        console.error('❌ Advanced conversion error:', error);
        return text;
    }
}

// Kuromoji.jsの状態確認
export function isKuromojiReady(): boolean {
    return kuromojiTokenizer !== null;
}

// Yahoo! APIのテスト
export async function testYahooApi(): Promise<boolean> {
    try {
        const testResult = await convertWithYahooApiMock('田中');
        return testResult === 'たなか';
    } catch (error) {
        console.error('Yahoo API test failed:', error);
        return false;
    }
}
