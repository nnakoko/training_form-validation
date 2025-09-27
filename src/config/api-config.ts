// API設定ファイル
export const API_CONFIG = {
    // Yahoo! API設定
    YAHOO_API_KEY: 'dj00aiZpPVNycHRIQnZoeHViViZzPWNvbnN1bWVyc2VjcmV0Jng9ZjI-', // ここに実際のAPIキーを入力してください
    YAHOO_API_URL: 'https://jlp.yahooapis.jp/JIMService/V2/conversion',

    // API設定
    API_TIMEOUT: 10000, // 10秒
    MAX_RETRIES: 3,

    // 開発環境設定
    IS_DEVELOPMENT: import.meta.env.DEV,
    IS_PRODUCTION: import.meta.env.PROD
};

// APIキーの検証
export function validateApiKey(): boolean {
    return API_CONFIG.YAHOO_API_KEY !== 'YOUR_YAHOO_API_KEY_HERE' &&
           API_CONFIG.YAHOO_API_KEY.length > 0;
}

// APIキーの設定
export function setYahooApiKey(apiKey: string): void {
    API_CONFIG.YAHOO_API_KEY = apiKey;
    console.log('✅ Yahoo API key updated');
}

// APIキーの取得（マスク済み）
export function getMaskedApiKey(): string {
    const key = API_CONFIG.YAHOO_API_KEY;
    if (key === 'YOUR_YAHOO_API_KEY_HERE') {
        return 'Not set';
    }
    return key.substring(0, 8) + '...' + key.substring(key.length - 4);
}
