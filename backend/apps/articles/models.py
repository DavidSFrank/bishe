"""
文章与内容模块 - 数据模型
"""
from django.db import models


class Article(models.Model):
    """健康常识文章"""
    title = models.CharField('标题', max_length=100)
    content = models.TextField('内容')
    cover_image = models.CharField('封面图', max_length=255, blank=True, default='')
    
    views_count = models.IntegerField('浏览量', default=0)
    
    is_active = models.BooleanField('是否发布', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'article'
        verbose_name = '健康常识'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Banner(models.Model):
    """轮播图"""
    title = models.CharField('标题', max_length=50, blank=True, default='')
    image = models.CharField('图片URL', max_length=255)
    link = models.CharField('跳转链接', max_length=255, blank=True, default='')
    sort_order = models.IntegerField('排序', default=0)
    
    is_active = models.BooleanField('是否启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'banner'
        verbose_name = '轮播图'
        verbose_name_plural = verbose_name
        ordering = ['sort_order', '-created_at']
    
    def __str__(self):
        return self.title or f'Banner-{self.id}'


class Consultation(models.Model):
    """在线咨询"""
    STATUS_CHOICES = (
        (0, '待回复'),
        (1, '已回复'),
    )
    
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, verbose_name='用户')
    content = models.TextField('咨询内容')
    reply = models.TextField('回复内容', blank=True, default='')
    status = models.SmallIntegerField('状态', choices=STATUS_CHOICES, default=0)
    
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    replied_at = models.DateTimeField('回复时间', null=True, blank=True)
    
    class Meta:
        db_table = 'consultation'
        verbose_name = '在线咨询'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user} - {self.content[:20]}'
