
import pytest
from httpx import AsyncClient

@pytest.mark.anyio
async def test_create_and_list_account(client: AsyncClient):
    async def override_get_current_user():
        return {'id': '00000000-0000-0000-0000-000000000000', 'email': 'test@example.com'}
    from app.api.deps import get_current_user
    client.app.dependency_overrides[get_current_user] = override_get_current_user
    account_in = {"name": "Carteira", "type": "checking", "currency": "BRL", "initial_balance": 100.0}
    resp = await client.post('/api/v1/accounts/', json=account_in)
    assert resp.status_code == 201
    data = resp.json()
    assert data['name'] == 'Carteira'
    resp = await client.get('/api/v1/accounts/')
    assert resp.status_code == 200
    assert len(resp.json()) == 1
