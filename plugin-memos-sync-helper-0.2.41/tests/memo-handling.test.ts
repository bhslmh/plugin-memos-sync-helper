import { describe, it, expect, vi, beforeEach } from 'vitest'
import { tagFilterKey, versionKey } from '@/constants/components/select'

// 隔离插件运行时依赖（@/index 会引入 siyuan 内核 API）
// vi.mock 工厂会被提升到顶部，因此用 vi.hoisted 定义共享配置
const { mockConfig } = vi.hoisted(() => ({
    mockConfig: {
        base: { version: 7 as number },
        filter: { tagFilterMode: 0 as number, tagList: '' as string },
        debug: { isDebug: false },
        imgbed: { enabled: false, links: {} as Record<string, string> },
        advanced: { showCreateTime: false, isHandleVideo: false, videoFormats: 'mp4', isHandleBacklinks: false, isHandleHref: false },
    }
}))
vi.mock('@/index', () => ({ pluginConfigData: mockConfig }))

import { MemosApiServiceV2 } from '@/controllers/memos/v2'

/** 26.11.1 风格的 memo：顶层 tags，property 无 tags，relations 为对象 */
const makeMemo = (overrides: any = {}) => ({
    name: 'memos/m1',
    content: 'hello',
    createTime: '2026-11-01T00:00:00Z',
    updateTime: '2026-11-01T00:00:00Z',
    tags: ['work'],
    property: { hasLink: false, hasCode: false, hasTaskList: false, hasIncompleteTasks: false },
    attachments: [{
        name: 'attachments/a1',
        filename: 'photo.png',
        type: 'image/png',
        createTime: '2026-11-01T00:00:00Z',
        memo: 'memos/m1',
    }],
    relations: [{
        memo: { name: 'memos/m1' },
        relatedMemo: { name: 'memos/m2' },
        type: 'REFERENCE',
    }],
    ...overrides,
})

describe('26.11.1 数据处理契约', () => {
    beforeEach(() => {
        mockConfig.base.version = versionKey.v26_11_1
        mockConfig.filter.tagFilterMode = tagFilterKey.all
        mockConfig.filter.tagList = ''
    })

    it('tags 过滤走顶层 tags（property 无 tags 也能命中指定标签）', async () => {
        mockConfig.filter.tagFilterMode = tagFilterKey.syncSpecTag
        mockConfig.filter.tagList = 'work'
        const result = await (MemosApiServiceV2 as any).tagFilter([makeMemo(), makeMemo({ name: 'memos/m2', tags: ['life'] })])
        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('memos/m1')
    })

    it('不同步无标签数据时，顶层 tags 为空的 memo 被过滤', async () => {
        mockConfig.filter.tagFilterMode = tagFilterKey.notSyncNoTag
        const result = await (MemosApiServiceV2 as any).tagFilter([makeMemo({ tags: [] })])
        expect(result).toHaveLength(0)
    })

    it('attachments 归一化为资源（含 uid / memo 归属）', () => {
        const resources = MemosApiServiceV2.normalizeResources(makeMemo() as any)
        expect(resources).toHaveLength(1)
        expect(resources[0]).toMatchObject({
            name: 'attachments/a1',
            uid: 'a1',
            filename: 'photo.png',
            type: 'image/png',
            memo: 'memos/m1',
        })
    })

    it('无 attachments 时返回空数组（不读 resources 字段）', () => {
        const resources = MemosApiServiceV2.normalizeResources(makeMemo({ attachments: undefined }) as any)
        expect(resources).toEqual([])
    })

    it('relations 为对象形式时保持原样供 DataSaveV2 消费', () => {
        const memo = makeMemo()
        expect(memo.relations[0].memo).toEqual({ name: 'memos/m1' })
        expect((memo.relations[0].memo as any).name.split('/').pop()).toBe('m1')
    })
})
