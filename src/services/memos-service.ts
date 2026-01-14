import type { MemoItem } from '../models/settings';
import { Logger } from './logger';
import { requestUrl, RequestUrlResponse } from 'obsidian';

export interface MemosResponse {
    memos: MemoItem[];
    nextPageToken?: string;
}

export class MemosService {
    private logger: Logger;

    constructor(
        private apiUrl: string,
        private accessToken: string,
        private syncLimit: number
    ) {
        this.logger = new Logger('MemosService');
    }

    async fetchAllMemos(): Promise<MemoItem[]> {
        try {
            this.logger.debug('开始获取 memos，API URL:', this.apiUrl);
            this.logger.debug('Access Token:', this.accessToken ? '已设置' : '未设置');
            this.logger.debug('同步限制:', this.syncLimit, '条');

            const allMemos: MemoItem[] = [];
            let pageToken: string | undefined;
            const pageSize = Math.min(100, this.syncLimit);

            // 验证 API URL 格式
            if (!this.apiUrl.includes('/api/v1')) {
                throw new Error('API URL 格式不正确，请确保包含 /api/v1');
            }

            do {
                const baseUrl = this.apiUrl;
                const url = `${baseUrl}/memos`;

                // 构建请求参数
            const params = new URLSearchParams({
                'state': 'NORMAL',
                'pageSize': pageSize.toString()
            });

            if (pageToken) {
                params.set('pageToken', pageToken);
            }

                const finalUrl = `${url}?${params.toString()}`;
                this.logger.debug('请求 URL:', finalUrl);

                const response = await requestUrl({
                    url: finalUrl,
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.status !== 200) {
                    throw new Error(`HTTP ${response.status}: 请求失败\n响应内容: ${response.text}`);
                }

                const responseData = response.json;
                this.logger.debug('API 响应数据:', responseData);

                if (!responseData || !Array.isArray(responseData.memos)) {
                    throw new Error('响应格式无效: 返回数据不包含 memos 数组');
                }

                const memos = responseData.memos;
                pageToken = responseData.nextPageToken;

                if (memos.length === 0) {
                    break; // 没有更多数据了
                }

                // 只添加需要的数量
                const remainingCount = this.syncLimit - allMemos.length;
                const neededCount = Math.min(memos.length, remainingCount);
                allMemos.push(...memos.slice(0, neededCount));
                this.logger.debug(`本次获取 ${neededCount} 条 memos，总计: ${allMemos.length}/${this.syncLimit}`);

                // 如果已经达到同步限制或没有下一页，就退出
                if (allMemos.length >= this.syncLimit || !pageToken) {
                    break;
                }

            } while (true);

            this.logger.debug(`最终返回 ${allMemos.length} 条 memos`);
            return allMemos.sort((a, b) => 
                new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
            );
        } catch (error) {
            this.logger.error('获取 memos 失败:', error);
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error(`网络错误: 无法连接到 ${this.apiUrl}。请检查 URL 是否正确且可访问。`);
            }
            throw error;
        }
    }

    async downloadResource(resource: { name: string; filename: string; type?: string }): Promise<ArrayBuffer | null> {
        try {
            // 从 resource.name 中提取 attachment ID
            // resource.name 格式: attachments/{attachment_id}
            const attachmentId = resource.name.split('/').pop() || resource.name;
            const resourceUrl = `${this.apiUrl.replace('/api/v1', '')}/file/attachments/${attachmentId}/${encodeURIComponent(resource.filename)}`;

            this.logger.debug(`正在下载资源: ${resourceUrl}`);

            const response = await requestUrl({
                url: resourceUrl,
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Accept': '*/*'
                },
                method: 'GET'
            });

            if (response.status !== 200) {
                this.logger.error(`下载资源失败: ${response.status}`);
                this.logger.error(`响应内容: ${response.text}`);
                return null;
            }

            // 检查是否有 arrayBuffer 属性
            if ('arrayBuffer' in response && response.arrayBuffer) {
                this.logger.debug(`成功获取资源，大小: ${response.arrayBuffer.byteLength} 字节`);
                return response.arrayBuffer;
            } else {
                // 如果没有 arrayBuffer，尝试使用其他方式获取二进制数据
                this.logger.warn('响应中没有 arrayBuffer 属性');
                return null;
            }
        } catch (error) {
            this.logger.error('下载资源时出错:', error);
            return null;
        }
    }
} 