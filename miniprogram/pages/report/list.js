// pages/report/list.js
const { get } = require('../../utils/request')
const { ensureUserSession } = require('../../utils/user-page')
const { REPORT_TEXTS } = require('./constants')

Page({
    data: {
        reports: [],
        loading: true,
        targetAppointmentId: '',
        focusReportId: 0,
        previewingId: 0,
        texts: REPORT_TEXTS
    },
    onLoad(options) {
        this.setData({ targetAppointmentId: options.appointmentId || '' })
    },
    async onShow() {
        const passed = await ensureUserSession()
        if (!passed) {
            return
        }
        this.loadData()
    },
    onPullDownRefresh() {
        this.loadData().finally(() => {
            wx.stopPullDownRefresh()
        })
    },
    async loadData() {
        try {
            const data = await get('/reports/my/')
            const rows = data.list || data || []
            const reports = rows.map((item) => ({
                ...item,
                displayTitleDate: item.report_date || REPORT_TEXTS.titleDateFallback,
                displayDoctor: item.doctor || REPORT_TEXTS.doctorFallback,
                displaySummary: item.result_summary || REPORT_TEXTS.summaryFallback
            }))
            const targetAppointmentId = String(this.data.targetAppointmentId || '')
            let focusReportId = 0

            if (targetAppointmentId) {
                const matched = reports.find((item) => {
                    const appointment = item && item.appointment ? item.appointment : null
                    const appointmentId = appointment ? appointment.id : ''
                    return String(appointmentId || '') === targetAppointmentId
                })
                if (matched && matched.id) {
                    focusReportId = matched.id
                }
            }

            this.setData({ reports, loading: false, focusReportId })
        } catch (e) {
            this.setData({ loading: false })
        }
    },
    onPreview(e) {
        const report = e.currentTarget.dataset.report || {}
        if (this.data.previewingId) {
            return
        }

        const url = report.file_url
        if (!url) {
            wx.showToast({ title: REPORT_TEXTS.noAttachment, icon: 'none' })
            return
        }

        const lower = String(url).toLowerCase()
        if (lower.endsWith('.pdf')) {
            this.setData({ previewingId: report.id || 0 })
            wx.downloadFile({
                url,
                success: (res) => {
                    wx.openDocument({ filePath: res.tempFilePath, showMenu: true })
                },
                fail: () => {
                    wx.showToast({ title: REPORT_TEXTS.previewFallback, icon: 'none' })
                    wx.navigateTo({ url: `/pages/report/detail?id=${report.id}` })
                },
                complete: () => {
                    this.setData({ previewingId: 0 })
                }
            })
            return
        }

        wx.previewImage({ urls: [url] })
    }
})
