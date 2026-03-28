// pages/appointment/list.js
Page({
    data: { appointments: [], loading: true, statusMap: { 0: '待审核', 1: '已确认', 2: '已完成', 3: '已取消', 4: '已拒绝' } },
    onShow() { this.loadData() },
    async loadData() {
        const { get } = require('../../utils/request')
        try {
            const data = await get('/appointments/my/')
            this.setData({ appointments: data.list || data, loading: false })
        } catch (e) { this.setData({ loading: false }) }
    },
    onDetail(e) { wx.navigateTo({ url: `/pages/report/detail?appointmentId=${e.currentTarget.dataset.id}` }) }
})
