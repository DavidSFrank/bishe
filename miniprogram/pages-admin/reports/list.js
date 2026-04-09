const { fetchReports, createReport, updateReport } = require('../../services/admin/reports')
const { ensureAdminSession } = require('../../utils/admin-page')

const PAGE_SIZE = 10

function promptText({ title, placeholder = '', defaultValue = '' }) {
    return new Promise((resolve, reject) => {
        wx.showModal({
            title,
            editable: true,
            placeholderText: placeholder,
            content: defaultValue,
            success: (res) => {
                if (!res.confirm) {
                    reject(new Error('cancel'))
                    return
                }
                resolve((res.content || '').trim())
            },
            fail: reject
        })
    })
}

Page({
    data: {
        loading: false,
        loadingMore: false,
        list: [],
        total: 0,
        page: 1,
        pageSize: PAGE_SIZE,
        hasMore: true
    },

    onShow() {
        if (!ensureAdminSession(this)) {
            return
        }
        this.loadData(true)
    },

    onPullDownRefresh() {
        this.loadData(true)
    },

    onReachBottom() {
        if (!this.data.hasMore) {
            return
        }
        this.loadData(false)
    },

    async loadData(reset = false) {
        const page = reset ? 1 : this.data.page
        const loadingKey = reset ? 'loading' : 'loadingMore'
        if (this.data[loadingKey]) {
            return
        }

        this.setData({ [loadingKey]: true })
        try {
            const data = await fetchReports({ page, page_size: this.data.pageSize })
            const incoming = data.list || []
            const nextList = reset ? incoming : this.data.list.concat(incoming)
            const total = Number(data.total || 0)
            this.setData({
                list: nextList,
                total,
                page: page + 1,
                hasMore: nextList.length < total
            })
        } catch (err) {
            console.error('load reports failed', err)
        } finally {
            this.setData({ [loadingKey]: false })
            if (reset) {
                wx.stopPullDownRefresh()
            }
        }
    },

    async onAdd() {
        try {
            const appointment = await promptText({ title: '录入报告', placeholder: '请输入预约ID' })
            if (!appointment) {
                wx.showToast({ title: '预约ID不能为空', icon: 'none' })
                return
            }
            const doctor = await promptText({ title: '录入报告', placeholder: '请输入报告医生（可选）' }).catch(() => '')
            const reportDate = await promptText({ title: '录入报告', placeholder: '请输入日期 YYYY-MM-DD（可选）' }).catch(() => '')
            const summary = await promptText({ title: '录入报告', placeholder: '请输入结果摘要（可选）' }).catch(() => '')
            const fileUrl = await promptText({ title: '录入报告', placeholder: '请输入报告文件URL（可选）' }).catch(() => '')

            await createReport({
                appointment: Number(appointment),
                doctor,
                report_date: reportDate,
                result_summary: summary,
                file_url: fileUrl
            })
            wx.showToast({ title: '录入成功', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            if (err && err.message !== 'cancel') {
                console.error('create report failed', err)
            }
        }
    },

    async onEdit(e) {
        const id = e.currentTarget.dataset.id
        const appointment = e.currentTarget.dataset.appointment
        const doctor = e.currentTarget.dataset.doctor || ''
        const reportDate = e.currentTarget.dataset.reportDate || ''
        const summary = e.currentTarget.dataset.summary || ''
        const fileUrl = e.currentTarget.dataset.fileUrl || ''
        if (!id || !appointment) {
            wx.showToast({ title: '报告信息无效', icon: 'none' })
            return
        }

        try {
            const nextDoctor = await promptText({ title: '编辑报告医生', placeholder: '请输入报告医生', defaultValue: doctor })
            const nextDate = await promptText({ title: '编辑报告日期', placeholder: '请输入日期 YYYY-MM-DD', defaultValue: reportDate })
            const nextSummary = await promptText({ title: '编辑结果摘要', placeholder: '请输入结果摘要', defaultValue: summary })
            const nextFileUrl = await promptText({ title: '编辑报告文件URL', placeholder: '请输入报告文件URL', defaultValue: fileUrl })

            await updateReport(id, {
                appointment: Number(appointment),
                doctor: nextDoctor,
                report_date: nextDate,
                result_summary: nextSummary,
                file_url: nextFileUrl
            })
            wx.showToast({ title: '更新成功', icon: 'success' })
            this.loadData(true)
        } catch (err) {
            if (err && err.message !== 'cancel') {
                console.error('update report failed', err)
            }
        }
    },

    goDashboard() {
        wx.navigateTo({ url: '/pages-admin/dashboard/index' })
    }
})

