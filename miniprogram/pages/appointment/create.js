// pages/appointment/create.js - 预约表单
const { post, get, requireUserLogin } = require('../../utils/request')
const { APPOINTMENT_TEXTS } = require('./constants')

function isValidPhone(phone) {
    return /^1\d{10}$/.test(phone)
}

function isValidIdCard(idCard) {
    return /^\d{17}[\dXx]$/.test(idCard)
}

Page({
    data: {
        packageId: '', packageName: '', price: 0,
        form: { name: '', phone: '', id_card: '', gender: 1, date: '', time_slot: '' },
        timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'],
        timeSlotIndex: -1, dateStr: ''
    },
    onLoad(options) {
        const today = new Date().toISOString().slice(0, 10)
        this.setData({
            packageId: options.packageId,
            packageName: options.packageName,
            price: options.price,
            today
        })
    },
    onShow() {
        this.initLoginAndProfile()
    },
    async initLoginAndProfile() {
        try {
            await requireUserLogin()
            const profile = await get('/users/me/')
            this.setData({
                'form.name': profile.real_name || '',
                'form.phone': profile.phone || '',
                'form.id_card': profile.id_card || '',
                'form.gender': profile.gender || 1
            })
        } catch (e) {
            wx.navigateBack()
        }
    },
    onInput(e) {
        const { field } = e.currentTarget.dataset
        this.setData({ [`form.${field}`]: e.detail.value })
    },
    onDateChange(e) { this.setData({ dateStr: e.detail.value, 'form.date': e.detail.value }) },
    onTimeChange(e) { this.setData({ timeSlotIndex: e.detail.value, 'form.time_slot': this.data.timeSlots[e.detail.value] }) },
    onGenderChange(e) { this.setData({ 'form.gender': parseInt(e.detail.value) }) },
    validateForm() {
        const { form, packageId, timeSlots, today } = this.data
        if (!packageId) {
            return APPOINTMENT_TEXTS.invalidPackage
        }
        if (!form.name || !form.phone || !form.id_card || !form.date || !form.time_slot) {
            return APPOINTMENT_TEXTS.incompleteForm
        }
        if (!isValidPhone(form.phone)) {
            return APPOINTMENT_TEXTS.invalidPhone
        }
        if (!isValidIdCard(form.id_card)) {
            return APPOINTMENT_TEXTS.invalidIdCard
        }
        if (form.date < today) {
            return APPOINTMENT_TEXTS.invalidDate
        }
        if (!timeSlots.includes(form.time_slot)) {
            return APPOINTMENT_TEXTS.invalidTimeSlot
        }
        return ''
    },
    async onSubmit() {
        const { form, packageId } = this.data
        const validateMessage = this.validateForm()
        if (validateMessage) {
            return wx.showToast({ title: validateMessage, icon: 'none' })
        }
        try {
            await post('/appointments/', { ...form, package: packageId })
            wx.showToast({ title: APPOINTMENT_TEXTS.submitSuccess, icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
        } catch (e) { console.error(e) }
    }
})
