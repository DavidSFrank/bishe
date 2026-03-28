"""
预约模块 - 数据模型
"""
from django.db import models


class Appointment(models.Model):
    """体检预约"""
    STATUS_CHOICES = (
        (0, '待审核'),
        (1, '已确认'),
        (2, '已完成'),
        (3, '已取消'),
        (4, '已拒绝'),
    )
    
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, verbose_name='用户')
    package = models.ForeignKey('packages.Package', on_delete=models.SET_NULL, null=True, verbose_name='套餐')
    
    # 体检人信息
    name = models.CharField('体检人姓名', max_length=50)
    phone = models.CharField('联系电话', max_length=20)
    id_card = models.CharField('身份证号', max_length=18)
    gender = models.SmallIntegerField('性别', choices=((1, '男'), (2, '女')), default=1)
    
    # 预约信息
    appointment_date = models.DateField('预约日期')
    time_slot = models.CharField('预约时段', max_length=20, help_text='如: 08:00-10:00')
    
    # 订单信息
    order_no = models.CharField('订单号', max_length=32, unique=True)
    amount = models.DecimalField('金额', max_digits=10, decimal_places=2)
    status = models.SmallIntegerField('状态', choices=STATUS_CHOICES, default=0)
    
    remark = models.CharField('备注', max_length=200, blank=True, default='')
    reject_reason = models.CharField('拒绝原因', max_length=200, blank=True, default='')
    
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'appointment'
        verbose_name = '体检预约'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.name} - {self.appointment_date}'
