// ライブラリ管理機能

// Wanakanaライブラリの型定義
declare global {
    interface Window {
        wanakana: any;
    }
}

// Wanakanaの読み込み完了を待つ関数
export function waitForWanakana(): Promise<boolean> {
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

        // タイムアウト設定（5秒）
        setTimeout(() => {
            console.warn('⚠️ Wanakana loading timeout after 5 seconds');
            window.removeEventListener('wanakanaLoaded', handleWanakanaLoaded);
            window.removeEventListener('wanakanaError', handleWanakanaError);
            resolve(false);
        }, 5000);
    });
}

// Wanakanaの状態確認
export function isWanakanaReady(): boolean {
    return typeof window !== 'undefined' && typeof window.wanakana !== 'undefined';
}
