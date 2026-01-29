
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import get_settings
from .api.routers import accounts, categories, transactions, budgets, users, health

settings = get_settings()

app = FastAPI(title='Finanças Pessoais API', version='0.1.0')

origins = [origin.strip() for origin in settings.allowed_origins.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(health.router)
app.include_router(users.router, prefix='/api/v1')
app.include_router(accounts.router, prefix='/api/v1')
app.include_router(categories.router, prefix='/api/v1')
app.include_router(transactions.router, prefix='/api/v1')
app.include_router(budgets.router, prefix='/api/v1')
