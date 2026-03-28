"""
报告模块 - 数据模型
"""
from django.db import models


class Report(models.Model):
    """体检报告"""
    appointment = models.OneToOneField(
        'appointments.Appointment', 
        on_delete=models.CASCADE, 
        verbose_name='关联预约'
    )
    
    # 报告内容
    result_summary = models.TextField('结果摘要', blank=True, default='')
    file_url = models.CharField('报告文件URL', max_length=255, blank=True, default='')
    
    # 生成信息
    doctor = models.CharField('报告医生', max_length=50, blank=True, default='')
    report_date = models.DateField('报告日期', null=True, blank=True)
    
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'report'
        verbose_name = '体检报告'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return f'报告-{self.appointment.name}'
