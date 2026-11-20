import {versionKey} from "@/constants/components/select";

export const API_VERSION = {
    V1: [versionKey.v0_21_0],
    V2: [versionKey.v0_22_0, versionKey.v0_22_1, versionKey.v0_23_0, versionKey.v0_24_0, versionKey.v0_25_0, versionKey.v0_26_0, versionKey.v26_11_1],
    /**
     * 支持标签过滤的版本
     */
    V2_LabelFilter: [versionKey.v0_22_1, versionKey.v0_23_0, versionKey.v0_24_0, versionKey.v0_25_0, versionKey.v0_26_0, versionKey.v26_11_1],
    V2_DownloadResourceByName: [versionKey.v0_22_0],
    V2_MemosViewFull: [versionKey.v0_23_0],
    /**
     * `/api/v1/memos` 修改了输入参数；26.x 日历版顶层 tags + 对象 relations 亦走此分组
     */
    V2_Y2025_M02_D05: [versionKey.v0_24_0, versionKey.v0_25_0, versionKey.v0_26_0, versionKey.v26_11_1]
}

export const DEFAULT_VERSION = versionKey.v0_26_0;

/**
 * 日历版（26.10+）REST 路由前缀由 /api/v1 改为 /api，旧路由在 26.11 已移除。
 * 只有这些版本需要把 API 路径降级为 /api/...
 */
export const CALENDAR_VERSIONS: versionKey[] = [versionKey.v26_11_1];

export const RELATION_TYPE = {
    reference: "REFERENCE",
    comment: "COMMENT"
}
