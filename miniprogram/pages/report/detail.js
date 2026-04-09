// pages/report/detail.js
// 兼容保留：当前用户端已无直接入口，保留用于历史链接兼容。
const { get } = require('../../utils/request')
const { ensureUserSession } = require('../../utils/user-page')
const { REPORT_TEXTS } = require('./constants')

Page({
    data: { report: null, loading: true, emptyText: REPORT_TEXTS.detailNotFound },
    onLoad(options) {
        this.targetId = options.id || options.appointmentId || ''
    },
    async onShow() {
        const passed = await ensureUserSession()
        if (!passed) {
            return
        }
        if (!this.targetId) {
            this.setData({ loading: false, report: null, emptyText: REPORT_TEXTS.detailNotFound })
            return
        }
        this.loadReport(this.targetId)
    },
    async loadReport(id) {
        this.setData({ loading: true, report: null, emptyText: REPORT_TEXTS.detailNotFound })
        try {
            const data = await get(`/reports/${id}/`)
            this.setData({ report: data, loading: false })
        } catch (e) {
            const message = (e && e.message) || ''
            const emptyText = message.includes('生成中') ? REPORT_TEXTS.detailGenerating : REPORT_TEXTS.detailNotFound
            this.setData({ loading: false, report: null, emptyText })
        }
    },
    onRetry() {
        if (!this.targetId) {
            return
        }
        this.loadReport(this.targetId)
    },
    onPreview() {
        const report = this.data.report || {}
        const url = report.file_url
        const lower = url.toLowerCase()
        if (lower.endsWith('.pdf')) {
            wx.downloadFile({
                url,
                success: res => {
                    wx.openDocument({ filePath: res.tempFilePath, showMenu: true })
                }
            })
        } else {
            wx.previewImage({ urls: [url] })
        }
    }
})
