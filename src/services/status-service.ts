import { Notice, setIcon } from 'obsidian';

type SyncStatus = 'idle' | 'syncing' | 'error' | 'success' | 'warning';

export class StatusService {
    private statusBarItem: HTMLElement;
    private currentStatus: SyncStatus = 'idle';
    private syncStartTime = 0;
    private progressCount = 0;
    private totalCount = 0;

    constructor(statusBarItem: HTMLElement) {
        this.statusBarItem = statusBarItem;
        this.updateStatusBar();
    }

    private updateStatusBar() {
        let icon: string;
        let text: string;
        
        switch (this.currentStatus) {
            case 'syncing': {
                icon = 'sync';
                const progress = this.totalCount ? ` ${this.progressCount}/${this.totalCount}` : '';
                const elapsed = this.syncStartTime ? ` (${Math.round((Date.now() - this.syncStartTime) / 1000)}s)` : '';
                text = `同步中${progress}${elapsed}`;
                break;
            }
            case 'error': {
                icon = 'alert-circle';
                text = '同步失败';
                break;
            }
            case 'success': {
                icon = 'check-circle';
                text = '同步完成';
                break;
            }
            case 'warning': {
                icon = 'alert-triangle';
                text = '警告';
                break;
            }
            default: {
                icon = 'clock';
                text = '等待同步';
            }
        }

        // 清空状态栏
        this.statusBarItem.innerHTML = '';
        
        // 创建图标元素
        const iconSpan = document.createElement('span');
        this.statusBarItem.appendChild(iconSpan);
        setIcon(iconSpan, icon);
        
        // 创建文本元素
        const textSpan = document.createElement('span');
        textSpan.textContent = ` ${text}`;
        this.statusBarItem.appendChild(textSpan);
    }

    startSync(totalItems: number) {
        this.currentStatus = 'syncing';
        this.syncStartTime = Date.now();
        this.progressCount = 0;
        this.totalCount = totalItems;
        this.updateStatusBar();
        new Notice('开始同步 Memos');
    }

    updateProgress(current: number, message?: string) {
        this.progressCount = current;
        this.updateStatusBar();
        if (message) {
            new Notice(message);
        }
    }

    setError(error: string) {
        this.currentStatus = 'error';
        this.updateStatusBar();
        new Notice(`同步失败: ${error}`, 5000);
        console.error('Sync failed:', error);
    }

    setSuccess(message: string) {
        this.currentStatus = 'success';
        this.updateStatusBar();
        new Notice(message);
        
        // 5秒后重置状态为空闲
        setTimeout(() => {
            this.currentStatus = 'idle';
            this.updateStatusBar();
        }, 5000);
    }

    setIdle() {
        this.currentStatus = 'idle';
        this.updateStatusBar();
    }

    setWarning(message: string) {
        this.currentStatus = 'warning';
        this.updateStatusBar();
        new Notice(message, 5000);
        console.warn('Warning:', message);
        
        // 5秒后重置状态为空闲
        setTimeout(() => {
            this.currentStatus = 'idle';
            this.updateStatusBar();
        }, 5000);
    }
} 