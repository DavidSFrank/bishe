from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.users.models import Admin, User, Favorite
from apps.packages.models import Category, Package
from apps.articles.models import Article, Banner, Consultation
from apps.appointments.models import Appointment
from apps.reports.models import Report


class Command(BaseCommand):
    help = 'Seed initial demo data for testing'

    def handle(self, *args, **options):
        admin, _ = Admin.objects.get_or_create(
            username='admin',
            defaults={'password': 'admin123', 'name': '系统管理员'}
        )

        user, _ = User.objects.get_or_create(
            openid='demo-openid',
            defaults={
                'nickname': '测试用户',
                'phone': '13800000000',
                'real_name': '张三',
                'id_card': '330101199001010000',
                'gender': 1
            }
        )

        cat1, _ = Category.objects.get_or_create(
            name='入职体检',
            defaults={'description': '适合入职前基础体检', 'sort_order': 1}
        )
        cat2, _ = Category.objects.get_or_create(
            name='老年体检',
            defaults={'description': '中老年专项体检', 'sort_order': 2}
        )

        pkg1, _ = Package.objects.get_or_create(
            name='基础入职体检',
            defaults={
                'category': cat1,
                'description': '血常规、尿常规、胸片、心电图',
                'price': 199,
                'original_price': 299,
                'image': '',
                'suitable_for': '18-45岁',
                'notice': '体检前请空腹8小时',
                'is_hot': True
            }
        )
        pkg2, _ = Package.objects.get_or_create(
            name='中老年体检套餐',
            defaults={
                'category': cat2,
                'description': '血脂、肝肾功能、B超、心电图',
                'price': 599,
                'original_price': 799,
                'image': '',
                'suitable_for': '50岁以上',
                'notice': '携带身份证',
                'is_hot': False
            }
        )

        Article.objects.get_or_create(
            title='体检前注意事项',
            defaults={'content': '<p>体检前8小时禁食，避免剧烈运动。</p>', 'is_active': True}
        )
        Banner.objects.get_or_create(
            title='健康体检季',
            defaults={'image': '', 'link': '', 'sort_order': 1, 'is_active': True}
        )

        appointment, _ = Appointment.objects.get_or_create(
            user=user,
            package=pkg1,
            appointment_date=timezone.localdate(),
            time_slot='08:00-10:00',
            defaults={
                'name': user.real_name,
                'phone': user.phone,
                'id_card': user.id_card,
                'gender': user.gender,
                'order_no': timezone.now().strftime('%Y%m%d%H%M%S') + '000001',
                'amount': pkg1.price,
                'status': 0
            }
        )
        # Keep one deterministic pending record for admin audit manual testing.
        if appointment.status != 0 or appointment.reject_reason:
            appointment.status = 0
            appointment.reject_reason = ''
            appointment.save(update_fields=['status', 'reject_reason', 'updated_at'])

        Report.objects.get_or_create(
            appointment=appointment,
            defaults={
                'result_summary': '总体正常，注意作息。',
                'file_url': '',
                'doctor': '李医生',
                'report_date': timezone.localdate()
            }
        )

        Consultation.objects.get_or_create(
            user=user,
            content='体检前可以喝水吗？',
            defaults={'reply': '少量饮水可以，避免饮料。', 'status': 1, 'replied_at': timezone.now()}
        )

        Favorite.objects.get_or_create(user=user, package=pkg1)

        self.stdout.write(self.style.SUCCESS('测试数据已初始化完成'))
