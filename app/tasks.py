from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_order_confirmation_email(user_email, order_id, total_price):
    send_mail(
        subject=f'Order #{order_id} confirmed',
        message=f'Your order #{order_id} has been placed. Total: {total_price}$',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
    )


@shared_task
def send_verification_email(user_email, code):
    send_mail(
        subject='PlantShop - Email Verification',
        message=f'Your verification code: {code}',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
    )


@shared_task
def clear_plants_cache():
    from django.core.cache import cache
    cache.delete('plants_list')
    cache.delete('categories')