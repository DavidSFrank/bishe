from django.core.management.base import BaseCommand

from apps.users.models import Admin, User, Favorite
from apps.packages.models import Category, Package
from apps.articles.models import Article, Banner, Consultation
from apps.appointments.models import Appointment
from apps.reports.models import Report


class Command(BaseCommand):
    help = 'Clear demo data from business tables'

    def handle(self, *args, **options):
        Report.objects.all().delete()
        Appointment.objects.all().delete()
        Favorite.objects.all().delete()
        Consultation.objects.all().delete()
        Banner.objects.all().delete()
        Article.objects.all().delete()
        Package.objects.all().delete()
        Category.objects.all().delete()
        User.objects.all().delete()
        Admin.objects.all().delete()

        self.stdout.write(self.style.SUCCESS('测试数据已清空'))
