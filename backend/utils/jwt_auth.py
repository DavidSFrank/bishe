import datetime
import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class SimpleUser:
    def __init__(self, user_id, role, username=None):
        self.id = user_id
        self.role = role
        self.username = username
        self.is_authenticated = True


def generate_token(payload, expires_in=7 * 24 * 60 * 60):
    exp = datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in)
    data = {**payload, "exp": exp}
    return jwt.encode(data, settings.SECRET_KEY, algorithm="HS256")


def decode_token(token):
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ', 1)[1].strip()
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError as exc:
            raise AuthenticationFailed('Token已过期') from exc
        except jwt.InvalidTokenError as exc:
            raise AuthenticationFailed('Token无效') from exc

        role = payload.get('role')
        user_id = payload.get('user_id')
        if not role or not user_id:
            raise AuthenticationFailed('Token无效')

        return SimpleUser(user_id, role, payload.get('username')), token
