// pages/appointment/create.js - 预约表单
Page({
    data: {
        packageId: '', packageName: '', price: 0,
        form: { name: '', phone: '', id_card: '', gender: 1, date: '', time_slot: '' },
        timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'],
        timeSlotIndex: -1, dateStr: ''
    },
    onLoad(options) {
        this.setData({
            packageId: options.packageId,
            packageName: options.packageName,
            price: options.price
        })
    },
    onInput(e) {
        const { field } = e.currentTarget.dataset
        this.setData({ [`form.${field}`]: e.detail.value })
    },
    onDateChange(e) { this.setData({ dateStr: e.detail.value, 'form.date': e.detail.value }) },
    onTimeChange(e) { this.setData({ timeSlotIndex: e.detail.value, 'form.time_slot': this.data.timeSlots[e.detail.value] }) },
    onGenderChange(e) { this.setData({ 'form.gender': parseInt(e.detail.value) }) },
    async onSubmit() {
        const { form, packageId } = this.data
        if (!form.name || !form.phone || !form.id_card || !form.date || !form.time_slot) {
            return wx.showToast({ title: '请填写完整信息', icon: 'none' })
        }
        const { post } = require('../../utils/request')
        try {
            await post('/appointments/', { ...form, package: packageId })
            wx.showToast({ title: '预约成功', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
        } catch (e) { console.error(e) }
    }
})
