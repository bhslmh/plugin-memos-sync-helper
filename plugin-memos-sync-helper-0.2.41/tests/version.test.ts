import { describe, it, expect } from 'vitest'
import { versionKey, VERSION_OPTIONS } from '@/constants/components/select'
import { API_VERSION } from '@/constants/memos'

describe('Memos 26.11.1 版本注册', () => {
    const v = versionKey.v26_11_1

    it('版本键已定义', () => {
        expect(v).toBeDefined()
    })

    it('归入 V2 系列', () => {
        expect(API_VERSION.V2).toContain(v)
    })

    it('归入 V2_LabelFilter（支持标签过滤）', () => {
        expect(API_VERSION.V2_LabelFilter).toContain(v)
    })

    it('归入 V2_Y2025_M02_D05（顶层 tags + 对象 relations + view 参数不传）', () => {
        expect(API_VERSION.V2_Y2025_M02_D05).toContain(v)
    })

    it('不属于旧版专用分组', () => {
        expect(API_VERSION.V1).not.toContain(v)
        expect(API_VERSION.V2_MemosViewFull).not.toContain(v)
        expect(API_VERSION.V2_DownloadResourceByName).not.toContain(v)
    })

    it('出现在版本选择列表且文案含日历版标识', () => {
        const option = VERSION_OPTIONS.find(o => o.key === v)
        expect(option).toBeDefined()
        expect(option?.text).toContain('26.11')
    })

    it('新版本键追加在末尾，不改变已有枚举值', () => {
        expect(versionKey.v0_21_0).toBe(0)
        expect(versionKey.v0_26_0).toBe(6)
        expect(v).toBe(7)
    })
})
