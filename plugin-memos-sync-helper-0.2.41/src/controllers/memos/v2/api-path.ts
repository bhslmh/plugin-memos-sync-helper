import {versionKey} from "@/constants/components/select";
import {CALENDAR_VERSIONS} from "@/constants/memos";

const V1_PREFIX = '/api/v1/';

/**
 * 按 Memos 版本把 API 路径转换为对应版本的服务端路由。
 * 26.10+ 日历版：REST 路由由 /api/v1/... 迁移到 /api/...，26.11 已移除旧路由。
 * 其余版本保持 /api/v1/... 原样。文件下载路径（/file/...）两版一致，不受影响。
 */
export function buildApiPath(version: versionKey, path: string): string {
    if (CALENDAR_VERSIONS.includes(version) && path.startsWith(V1_PREFIX)) {
        return '/api/' + path.slice(V1_PREFIX.length);
    }
    return path;
}
