import { Plugin } from 'obsidian';
import { MemosPluginSettings, DEFAULT_SETTINGS } from './settings';

export default class MemosSyncPlugin extends Plugin {
    settings: MemosPluginSettings;

    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }
} 