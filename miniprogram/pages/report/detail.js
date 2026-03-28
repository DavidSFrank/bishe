// pages/report/detail.js
Page({
    data: { report: null, loading: true },
    onLoad(options) { if (options.id) this.loadReport(options.id) },
    async loadReport(id) {
        const { get } = require('../../utils/request')
        try {
            const data = await get(`/reports/${id}/`)
            this.setData({ report: data, loading: false })
        } catch (e) { this.setData({ loading: false }) }
    },
    onPreview() {
        const url = this.data.report?.file_url
        if (!url) return
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
