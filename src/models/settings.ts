// AI 模型类型
export type AIModelType = 'openai' | 'gemini' | 'claude' | 'ollama';

// Memo 项目接口
export interface MemoItem {
    name: string;
    content: string;
    visibility: string;
    createTime: string;
    updateTime: string;
    displayTime: string;
    creator: string;
    state: string;
    pinned: boolean;
    attachments: Array<{
        name: string;
        filename: string;
        type: string;
        size: string;
        createTime: string;
    }>;
    tags: string[];
}

// AI 功能配置
export interface AISettings {
    enabled: boolean;
    modelType: AIModelType;
    apiKey: string;
    modelName: string;
    customModelName: string;
    openaiBaseUrl: string;
    ollamaBaseUrl: string;
    weeklyDigest: boolean;
    autoTags: boolean;
    intelligentSummary: boolean;
    summaryLanguage: 'zh' | 'en' | 'ja' | 'ko';
}

// 主设置接口
export interface MemosPluginSettings {
    memosApiUrl: string;
    memosAccessToken: string;
    syncDirectory: string;
    syncFrequency: 'manual' | 'auto';
    autoSyncInterval: number;
    syncLimit: number;
    ai: AISettings;
}

// 默认设置
export const DEFAULT_SETTINGS: MemosPluginSettings = {
    memosApiUrl: '',
    memosAccessToken: '',
    syncDirectory: 'memos',
    syncFrequency: 'manual',
    autoSyncInterval: 30,
    syncLimit: 1000,
    ai: {
        enabled: false,
        modelType: 'openai',
        apiKey: '',
        modelName: 'gpt-4o',
        customModelName: '',
        openaiBaseUrl: 'https://api.openai.com/v1',
        ollamaBaseUrl: 'http://localhost:11434',
        weeklyDigest: true,
        autoTags: true,
        intelligentSummary: true,
        summaryLanguage: 'zh'
    }
};