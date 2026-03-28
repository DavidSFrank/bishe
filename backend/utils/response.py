from rest_framework.response import Response


def success(data=None, message="ok", code=200, status=200):
    return Response({"code": code, "message": message, "data": data}, status=status)


def error(message="error", code=400, status=200, data=None):
    return Response({"code": code, "message": message, "data": data}, status=status)
