import { describe, it, expect, vi, beforeEach } from 'vitest'
import { syncPlanKey, memosSortKey } from '@/constants/components/select'

// 注意：syncPlanKey.dailyNotes=0, singleDoc=1, sameDoc=2；memosSortKey.desc=0, asc=1
// 避免在 vi.hoisted 中引用 import 绑定（提升导致未初始化），此处用字面量

// 隔离插件运行时配置与 siyuan 内核依赖
const {
    mockConfig,
    mockApi,
    mockService,
} = vi.hoisted(() => ({
    mockConfig: {
        base: {
            version: 7 as number,
            notebook: 'nb-1',
            docPath: '',
            syncPlan: 0 as number,
            memosSort: 1 as number,
        },
        filter: { forceFullSync: false as boolean },
        debug: { isDebug: false },
        advanced: {} as Record<string, unknown>,
        imgbed: { enabled: false, links: {} as Record<string, string> },
    },
    mockApi: {
        appendBlock: vi.fn(),
        prependBlock: vi.fn(),
        createDocWithMd: vi.fn(),
        deleteBlock: vi.fn(),
        getChildBlocks: vi.fn(),
        getNotebookConf: vi.fn(),
        prependBlockRaw: vi.fn(),
        removeDoc: vi.fn(),
        setBlockAttrs: vi.fn(),
        sql: vi.fn(),
        updateBlock: vi.fn(),
    },
    mockService: {
        getDailyNotePath: vi.fn(),
        getDocumentIdByHPath: vi.fn(),
        getBlockId: vi.fn(),
        getAttrByName: vi.fn(),
        getAttributes: vi.fn(),
    },
}))

vi.mock('@/index', () => ({ pluginConfigData: mockConfig }))
vi.mock('@/controllers/siyuan/api', () => ({
    appendBlock: mockApi.appendBlock,
    prependBlock: mockApi.prependBlock,
    createDocWithMd: mockApi.createDocWithMd,
    deleteBlock: mockApi.deleteBlock,
    getChildBlocks: mockApi.getChildBlocks,
    getNotebookConf: mockApi.getNotebookConf,
    removeDoc: mockApi.removeDoc,
    setBlockAttrs: mockApi.setBlockAttrs,
    sql: mockApi.sql,
    updateBlock: mockApi.updateBlock,
}))
vi.mock('@/controllers/siyuan', () => ({
    SiYuanApiService: {
        getDailyNotePath: mockService.getDailyNotePath,
        getDocumentIdByHPath: mockService.getDocumentIdByHPath,
        getBlockId: mockService.getBlockId,
        getAttrByName: mockService.getAttrByName,
        getAttributes: mockService.getAttributes,
    },
}))

import { DataSaveBase } from '@/controllers/plugin/common/save/DataSaveBase'

// 构造一个可测试的子类：暴露 saveDailyNotes 与内部字典
class TestDataSave extends DataSaveBase {
    constructor(data: any) { super(data) }
    async getMemoId(memo: any) { return memo.id }
    async handleRelations() {}
    callSaveDailyNotes(memo: any) { return (this as any).saveDailyNotes(memo) }
    getIdMap() { return this.memoIdLinkBlockId }
}

const makeMemo = (overrides: any = {}) => ({
    id: 'm1',
    uid: 'm1',
    // showCreateTime=true 时 DataHandle 生成的 title 会带上 <创建时间>，造成日期重复
    title: '2026-05-22 01:04:52 <2026-05-22 00:30:00>',
    updateTime: '2026-05-22 01:04:52',
    contents: [
        { type: 'text', content: '窍穴 种药 获得各种能力' },
        { type: 'text', content: '毒性 解毒 恢复等等' },
    ],
    ...overrides,
})

describe('dailyNotes 保存为天文档内的块（不再建子文档）', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockConfig.base.syncPlan = syncPlanKey.dailyNotes
        mockConfig.base.memosSort = memosSortKey.asc
        mockConfig.filter.forceFullSync = false
        mockService.getDailyNotePath.mockResolvedValue('/daily note/2026/05/2026-05-22')
        mockService.getDocumentIdByHPath.mockResolvedValue('day-doc-id')
        // appendBlock 返回列表块操作结果
        mockApi.appendBlock.mockResolvedValue([{ doOperations: [{ id: 'list-block-id' }] }])
        mockService.getBlockId.mockImplementation((r: any) => r[0].doOperations[0].id)
        // getChildBlocks 返回列表项块（正文将缩进到它下面）
        mockApi.getChildBlocks.mockResolvedValue([{ id: 'title-block-id' }])
        mockApi.setBlockAttrs.mockResolvedValue({})
    })

    it('创建当天日记文档内的列表块，而非 memo 子文档', async () => {
        const saver = new TestDataSave({ oldMemos: [], newMemos: [] })
        await saver.callSaveDailyNotes(makeMemo())

        // 关键断言 1：绝不调用 createDocWithMd 建子文档
        expect(mockApi.createDocWithMd).not.toHaveBeenCalled()
        // 关键断言 2：用纯更新时间做列表标注，无星号、无 <创建时间> 重复
        expect(mockApi.appendBlock).toHaveBeenCalledWith(
            'markdown',
            '- 2026-05-22 01:04:52',
            'day-doc-id'
        )
    })

    it('正文作为列表项的子块逐条追加（缩进效果）', async () => {
        const saver = new TestDataSave({ oldMemos: [], newMemos: [] })
        await saver.callSaveDailyNotes(makeMemo())

        expect(mockApi.appendBlock).toHaveBeenCalledWith(
            'markdown', '窍穴 种药 获得各种能力', 'title-block-id'
        )
        expect(mockApi.appendBlock).toHaveBeenCalledWith(
            'markdown', '毒性 解毒 恢复等等', 'title-block-id'
        )
    })

    it('建立 memoId -> 列表项块ID 的映射，保证删除/引用正常', async () => {
        const saver = new TestDataSave({ oldMemos: [], newMemos: [] })
        await saver.callSaveDailyNotes(makeMemo({ id: 'm1', uid: 'u1' }))

        expect(saver.getIdMap()['m1']).toBe('title-block-id')
        expect(mockApi.setBlockAttrs).toHaveBeenCalledWith(
            'title-block-id',
            expect.objectContaining({ 'custom-memo-id': 'm1', 'custom-memo-uid': 'u1' })
        )
    })

    it('降序时用 prependBlock 插入到天文档顶部', async () => {
        mockConfig.base.memosSort = memosSortKey.desc
        mockApi.prependBlock.mockResolvedValue([{ doOperations: [{ id: 'list-block-id' }] }])
        const saver = new TestDataSave({ oldMemos: [], newMemos: [] })
        await saver.callSaveDailyNotes(makeMemo())

        expect(mockApi.prependBlock).toHaveBeenCalledWith(
            'markdown', '- 2026-05-22 01:04:52', 'day-doc-id'
        )
        expect(mockApi.appendBlock).not.toHaveBeenCalledWith(
            'markdown', '- 2026-05-22 01:04:52', 'day-doc-id'
        )
    })
})
