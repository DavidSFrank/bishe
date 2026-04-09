from django.test import TestCase
from rest_framework.test import APIClient
from apps.users.models import User
from apps.packages.models import Category, Package
from apps.appointments.models import Appointment
from apps.reports.models import Report
from apps.articles.models import Consultation


class SmokeTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_wx_login_returns_profile_status(self):
        response = self.client.post('/api/users/login/', {'code': 'wx-code-001'}, format='json')
        body = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(body['code'], 200)
        self.assertIn('token', body['data'])
        self.assertTrue(body['data']['is_new_user'])
        self.assertFalse(body['data']['profile_completed'])

    def test_appointment_requires_profile_or_uses_profile_values(self):
        user = User.objects.create(openid='wx-code-002')
        category = Category.objects.create(name='基础体检')
        package = Package.objects.create(category=category, name='基础套餐', price=199)

        login_response = self.client.post('/api/users/login/', {'code': user.openid}, format='json').json()
        token = login_response['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        blocked = self.client.post('/api/appointments/', {
            'package': package.id,
            'date': '2026-04-08',
            'time_slot': '09:00-10:00'
        }, format='json')
        self.assertEqual(blocked.status_code, 400)
        self.assertIn('请先完善个人资料后再预约', str(blocked.json()))

        user.real_name = '张三'
        user.phone = '13800138000'
        user.id_card = '11010119900307321X'
        user.gender = 1
        user.save(update_fields=['real_name', 'phone', 'id_card', 'gender'])

        created = self.client.post('/api/appointments/', {
            'package': package.id,
            'date': '2026-04-09',
            'time_slot': '10:00-11:00'
        }, format='json')
        created_body = created.json()

        self.assertEqual(created.status_code, 201)
        self.assertEqual(created_body['code'], 200)
        self.assertEqual(created_body['data']['name'], '张三')
        self.assertEqual(created_body['data']['phone'], '13800138000')

    def test_users_me_get_and_put(self):
        user = User.objects.create(openid='wx-code-003')
        login_response = self.client.post('/api/users/login/', {'code': user.openid}, format='json').json()
        token = login_response['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        me = self.client.get('/api/users/me/')
        me_body = me.json()
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me_body['code'], 200)
        self.assertIn('profile_completed', me_body['data'])

        updated = self.client.put('/api/users/me/', {
            'nickname': '测试用户',
            'phone': '13800138000',
            'real_name': '李四',
            'id_card': '11010119900307321X',
            'gender': 1,
        }, format='json')
        updated_body = updated.json()
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated_body['data']['nickname'], '测试用户')
        self.assertTrue(updated_body['data']['profile_completed'])

    def test_user_can_cancel_own_pending_appointment(self):
        user = User.objects.create(openid='wx-code-004', real_name='王五', phone='13800138000', id_card='11010119900307321X')
        category = Category.objects.create(name='基础体检')
        package = Package.objects.create(category=category, name='基础套餐', price=199)
        appointment = Appointment.objects.create(
            user=user,
            package=package,
            name='王五',
            phone='13800138000',
            id_card='11010119900307321X',
            gender=1,
            appointment_date='2026-04-10',
            time_slot='08:00-09:00',
            order_no='T202604100001',
            amount=199,
            status=0,
        )

        token = self.client.post('/api/users/login/', {'code': user.openid}, format='json').json()['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.post(f'/api/appointments/{appointment.id}/cancel/', {}, format='json')
        body = response.json()
        appointment.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(body['code'], 200)
        self.assertEqual(appointment.status, 3)

    def test_user_cannot_cancel_non_pending_or_others(self):
        owner = User.objects.create(openid='wx-code-005', real_name='赵六', phone='13800138000', id_card='11010119900307321X')
        other = User.objects.create(openid='wx-code-006', real_name='孙七', phone='13900139000', id_card='110101199003073219')
        category = Category.objects.create(name='进阶体检')
        package = Package.objects.create(category=category, name='进阶套餐', price=399)

        confirmed = Appointment.objects.create(
            user=owner,
            package=package,
            name='赵六',
            phone='13800138000',
            id_card='11010119900307321X',
            gender=1,
            appointment_date='2026-04-11',
            time_slot='09:00-10:00',
            order_no='T202604110001',
            amount=399,
            status=1,
        )
        other_record = Appointment.objects.create(
            user=other,
            package=package,
            name='孙七',
            phone='13900139000',
            id_card='110101199003073219',
            gender=1,
            appointment_date='2026-04-12',
            time_slot='10:00-11:00',
            order_no='T202604120001',
            amount=399,
            status=0,
        )

        token = self.client.post('/api/users/login/', {'code': owner.openid}, format='json').json()['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        non_pending = self.client.post(f'/api/appointments/{confirmed.id}/cancel/', {}, format='json')
        self.assertEqual(non_pending.status_code, 400)
        self.assertIn('当前状态不可取消', str(non_pending.json()))

        others = self.client.post(f'/api/appointments/{other_record.id}/cancel/', {}, format='json')
        self.assertEqual(others.status_code, 400)
        self.assertIn('预约记录不存在', str(others.json()))

    def test_my_appointments_support_status_filter(self):
        user = User.objects.create(openid='wx-code-007', real_name='周八', phone='13800138000', id_card='11010119900307321X')
        category = Category.objects.create(name='专项体检')
        package = Package.objects.create(category=category, name='专项套餐', price=299)
        Appointment.objects.create(
            user=user,
            package=package,
            name='周八',
            phone='13800138000',
            id_card='11010119900307321X',
            gender=1,
            appointment_date='2026-04-13',
            time_slot='08:00-09:00',
            order_no='T202604130001',
            amount=299,
            status=0,
        )
        Appointment.objects.create(
            user=user,
            package=package,
            name='周八',
            phone='13800138000',
            id_card='11010119900307321X',
            gender=1,
            appointment_date='2026-04-14',
            time_slot='09:00-10:00',
            order_no='T202604140001',
            amount=299,
            status=3,
        )

        token = self.client.post('/api/users/login/', {'code': user.openid}, format='json').json()['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/appointments/my/?status=3')
        body = response.json()
        rows = body['data']['list']

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]['status'], 3)

    def test_report_retrieve_supports_appointment_id_lookup(self):
        user = User.objects.create(openid='wx-code-008')
        category = Category.objects.create(name='报告体检')
        package = Package.objects.create(category=category, name='报告套餐', price=299)
        appointment = Appointment.objects.create(
            user=user,
            package=package,
            name='测试用户',
            phone='13800138000',
            id_card='11010119900307321X',
            gender=1,
            appointment_date='2026-04-15',
            time_slot='08:00-09:00',
            order_no='T202604150001',
            amount=299,
            status=2,
        )
        report = Report.objects.create(
            appointment=appointment,
            result_summary='体检指标正常',
            doctor='李医生',
            report_date='2026-04-16',
        )

        token = self.client.post('/api/users/login/', {'code': user.openid}, format='json').json()['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get(f'/api/reports/{appointment.id}/')
        body = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(body['code'], 200)
        self.assertEqual(body['data']['id'], report.id)

    def test_report_detail_isolated_between_users(self):
        owner = User.objects.create(openid='wx-code-009')
        stranger = User.objects.create(openid='wx-code-010')
        category = Category.objects.create(name='隔离体检')
        package = Package.objects.create(category=category, name='隔离套餐', price=199)
        appointment = Appointment.objects.create(
            user=owner,
            package=package,
            name='拥有者',
            phone='13800138000',
            id_card='11010119900307321X',
            gender=1,
            appointment_date='2026-04-17',
            time_slot='09:00-10:00',
            order_no='T202604170001',
            amount=199,
            status=2,
        )
        Report.objects.create(appointment=appointment, result_summary='正常')

        token = self.client.post('/api/users/login/', {'code': stranger.openid}, format='json').json()['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        denied = self.client.get(f'/api/reports/{appointment.id}/')
        self.assertEqual(denied.status_code, 404)
        self.assertIn('报告不存在', str(denied.json()))

    def test_report_detail_returns_generating_message_when_report_not_ready(self):
        user = User.objects.create(openid='wx-code-011')
        category = Category.objects.create(name='待生成体检')
        package = Package.objects.create(category=category, name='待生成套餐', price=199)
        appointment = Appointment.objects.create(
            user=user,
            package=package,
            name='待生成用户',
            phone='13800138000',
            id_card='11010119900307321X',
            gender=1,
            appointment_date='2026-04-18',
            time_slot='10:00-11:00',
            order_no='T202604180001',
            amount=199,
            status=2,
        )

        token = self.client.post('/api/users/login/', {'code': user.openid}, format='json').json()['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        pending = self.client.get(f'/api/reports/{appointment.id}/')
        self.assertEqual(pending.status_code, 404)
        self.assertIn('报告生成中', str(pending.json()))

    def test_user_can_withdraw_pending_consultation(self):
        user = User.objects.create(openid='wx-code-012')
        consultation = Consultation.objects.create(user=user, content='多久可以出报告？', status=0)

        token = self.client.post('/api/users/login/', {'code': user.openid}, format='json').json()['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.delete(f'/api/articles/consultations/{consultation.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Consultation.objects.filter(id=consultation.id).exists())

    def test_user_cannot_withdraw_replied_consultation(self):
        user = User.objects.create(openid='wx-code-013')
        consultation = Consultation.objects.create(user=user, content='体检前能吃药吗？', status=1, reply='请遵医嘱')

        token = self.client.post('/api/users/login/', {'code': user.openid}, format='json').json()['data']['token']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.delete(f'/api/articles/consultations/{consultation.id}/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('已回复咨询不可撤回', str(response.json()))

