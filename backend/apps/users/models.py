"""
用户模块 - 数据模型
"""
from django.db import models


class User(models.Model):
    """微信用户"""
    openid = models.CharField('微信OpenID', max_length=100, unique=True)
    nickname = models.CharField('昵称', max_length=50, blank=True, default='')
    avatar = models.URLField('头像URL', blank=True, default='')
    phone = models.CharField('手机号', max_length=20, blank=True, default='')
    real_name = models.CharField('真实姓名', max_length=50, blank=True, default='')
    id_card = models.CharField('身份证号', max_length=18, blank=True, default='')
    gender = models.SmallIntegerField('性别', choices=((0, '未知'), (1, '男'), (2, '女')), default=0)
    
    is_active = models.BooleanField('是否启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'user'
        verbose_name = '用户'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return self.nickname or self.openid[:8]


class Admin(models.Model):
    """管理员"""
    username = models.CharField('用户名', max_length=50, unique=True)
    password = models.CharField('密码', max_length=128)
    name = models.CharField('姓名', max_length=50, blank=True, default='')
    
    is_active = models.BooleanField('是否启用', default=True)
    last_login = models.DateTimeField('最后登录', null=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'admin'
        verbose_name = '管理员'
        verbose_name_plural = verbose_name
    
    def __str__(self):
        return self.username


class Favorite(models.Model):
    """用户收藏"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='用户')
    package = models.ForeignKey('packages.Package', on_delete=models.CASCADE, verbose_name='套餐')
    created_at = models.DateTimeField('收藏时间', auto_now_add=True)
    
    class Meta:
        db_table = 'favorite'
        verbose_name = '收藏'
        verbose_name_plural = verbose_name
        unique_together = ['user', 'package']
