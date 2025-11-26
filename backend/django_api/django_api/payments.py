from ninja import Router, Schema
from django.conf import settings
import stripe

router = Router()
stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentIntentIn(Schema):
    amount: int
    currency: str = "usd"


class CreatePaymentIntentOut(Schema):
    clientSecret: str
    paymentIntentId: str


@router.post("/create-payment-intent", response=CreatePaymentIntentOut)
def create_payment_intent(request, payload: CreatePaymentIntentIn):
    intent = stripe.PaymentIntent.create(
        amount=payload.amount,
        currency=payload.currency,
        automatic_payment_methods={"enabled": True},
    )

    return {
        "clientSecret": intent.client_secret,
        "paymentIntentId": intent.id,
    }
