"""
体检套餐模块 - 数据模型
"""
from django.db import models


class Category(models.Model):
    """体检套餐分类"""
    name = models.CharField('分类名称', max_length=50)
    description = models.CharField('描述', max_length=200, blank=True, default='')
    icon = models.CharField('图标', max_length=100, blank=True, default='')
    sort_order = models.IntegerField('排序', default=0)
    
    is_active = models.BooleanField('是否启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'category'
        verbose_name = '套餐分类'
        verbose_name_plural = verbose_name
        ordering = ['sort_order', '-created_at']
    
    def __str__(self):
        return self.name


class Package(models.Model):
    """体检套餐"""
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, verbose_name='所属分类')
    name = models.CharField('套餐名称', max_length=100)
    description = models.TextField('套餐描述', blank=True, default='')
    price = models.DecimalField('价格', max_digits=10, decimal_places=2)
    original_price = models.DecimalField('原价', max_digits=10, decimal_places=2, null=True, blank=True)
    image = models.CharField('封面图', max_length=255, blank=True, default='')
    
    # 套餐详情
    items = models.TextField('包含项目', blank=True, default='', help_text='JSON格式存储项目列表')
    suitable_for = models.CharField('适用人群', max_length=200, blank=True, default='')
    notice = models.TextField('注意事项', blank=True, default='')
    
    # 统计
    sales_count = models.IntegerField('销量', default=0)
    views_count = models.IntegerField('浏览量', default=0)
    
    is_hot = models.BooleanField('热门推荐', default=False)
    is_active = models.BooleanField('是否上架', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'package'
        verbose_name = '体检套餐'
        verbose_name_plural = verbose_name
        ordering = ['-is_hot', '-sales_count', '-created_at']
    
    def __str__(self):
        return self.name
