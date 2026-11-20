import { describe, it, expect } from 'vitest'
import { versionKey } from '@/constants/components/select'
import { buildApiPath } from '@/controllers/memos/v2/api-path'

describe('日历版 API 路径映射', () => {
    it('26.11.1: /api/v1/memos -> /api/memos', () => {
        expect(buildApiPath(versionKey.v26_11_1, '/api/v1/memos')).toBe('/api/memos')
    })

    it('26.11.1: /api/v1/auth/me -> /api/auth/me', () => {
        expect(buildApiPath(versionKey.v26_11_1, '/api/v1/auth/me')).toBe('/api/auth/me')
    })

    it('26.11.1: /api/v1/memos/{id} -> /api/memos/{id}', () => {
        expect(buildApiPath(versionKey.v26_11_1, '/api/v1/memos/123')).toBe('/api/memos/123')
    })

    it('旧版 v0.26.0 保持 /api/v1 前缀不变', () => {
        expect(buildApiPath(versionKey.v0_26_0, '/api/v1/memos')).toBe('/api/v1/memos')
        expect(buildApiPath(versionKey.v0_21_0, '/api/v1/memos')).toBe('/api/v1/memos')
    })

    it('非 /api/v1 前缀路径原样返回（文件下载路径两版一致）', () => {
        expect(buildApiPath(versionKey.v26_11_1, '/file/attachments/abc/a.png')).toBe('/file/attachments/abc/a.png')
        expect(buildApiPath(versionKey.v26_11_1, '/api/v1alpha1/memos')).toBe('/api/v1alpha1/memos')
    })

    it('边界：恰好以 /api/v1/ 结尾时也能转换', () => {
        expect(buildApiPath(versionKey.v26_11_1, '/api/v1/')).toBe('/api/')
    })
})
