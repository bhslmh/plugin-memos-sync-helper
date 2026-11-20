export interface IResourceV2 {
    name: string,
    uid: string,
    createTime: string,
    filename: string,
    content: string,
    externalLink: string,
    type: string,
    size: string,
    memo: string
}

export interface IAttachmentV2 {
    name: string,
    filename: string,
    externalLink: string,
    type: string,
    size: string,
    createTime?: string,
    uid?: string,
    memo?: string,
    content?: string,
    /** 26.x 日历版字段 */
    creator?: string,
    mediaMetadata?: any,
    motionMedia?: any
}

export interface IRelationV2 {
    memo: string,
    relatedMemo: string,
    type: string
}

/**
 * v0.24+ / 26.x relations：memo 与 relatedMemo 为对象。
 * 26.11.1 仅含 name + snippet（无 uid），旧版可能含 uid，故 uid 设为可选。
 */
export interface IRelationV0_24_0 {
    memo: {
        name: string,
        uid?: string,
        snippet?: string
    },
    relatedMemo: {
        name: string,
        uid?: string,
        snippet?: string
    },
    type: string
}

/**
 * 评论
 */
export interface IReactionV2 {
    id: number,
    creator: string,
    contentId: string,
    reactionType: string
}

export interface IPropertyV2 {
    tags?: any,
    hasLink: boolean,
    hasTaskList: boolean,
    hasCode: boolean,
    hasIncompleteTasks: boolean,
    /** 26.x 日历版字段：tags 移至 Memo 顶层，property 新增 title / hasInlineImage */
    title?: string,
    hasInlineImage?: boolean
}

/**
 * Memos
 */
export interface IMemoV2 {
    name: string,
    uid?: string | null,
    rowStatus: string,
    creator: string,
    createTime: string,
    updateTime: string,
    displayTime: string,
    content: string,
    nodes: any,
    visibility: string,
    tags: any,
    pinned: boolean,
    parentId?: number,
    resources?: IResourceV2[],
    attachments?: IAttachmentV2[],
    relations: IRelationV2[],
    reactions: IReactionV2[]
    property?: IPropertyV2,
    snippet?: string
}

export interface IMemoV0_24_0 {
    name: string,
    state: string,
    creator: string,
    createTime: string,
    updateTime: string,
    displayTime: string,
    content: string,
    nodes: any,
    visibility: string,
    tags: any,
    pinned: boolean,
    parentId?: number,
    resources?: IResourceV2[],
    attachments?: IAttachmentV2[],
    relations: IRelationV0_24_0[],
    reactions: IReactionV2[]
    property?: IPropertyV2,
    snippet?: string
}

/**
 * 26.10+ 日历版 Memo：结构与 IMemoV0_24_0 一致（顶层 tags、对象 relations、state），
 * 新增 space / location / parent（字符串资源名）等字段。
 */
export interface IMemoV26 {
    name: string,
    state: string,
    creator: string,
    createTime: string,
    updateTime: string,
    content: string,
    visibility: string,
    tags: string[],
    pinned: boolean,
    attachments?: IAttachmentV2[],
    relations: IRelationV0_24_0[],
    reactions: IReactionV2[],
    property?: IPropertyV2,
    snippet?: string,
    space?: string,
    location?: any,
    parent?: string
}
