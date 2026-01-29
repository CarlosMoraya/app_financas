
from fastapi import APIRouter, Depends, HTTPException, status
from ...schemas.category import CategoryCreate, CategoryUpdate, CategoryRead
from ...services.categories import CategoryService
from ...repositories.categories import CategoryRepository
from ...api.deps import get_current_user, get_db

router = APIRouter(prefix='/categories', tags=['categories'])

@router.get('/', response_model=list[CategoryRead])
async def list_categories(user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = CategoryService(CategoryRepository(db), user_id=user['id'])
    return await service.list_categories()

@router.post('/', response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(obj_in: CategoryCreate, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = CategoryService(CategoryRepository(db), user_id=user['id'])
    return await service.create_category(obj_in)

@router.get('/{category_id}', response_model=CategoryRead)
async def get_category(category_id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = CategoryService(CategoryRepository(db), user_id=user['id'])
    category = await service.get_category(category_id)
    if not category:
        raise HTTPException(status_code=404, detail='Category not found')
    return category

@router.put('/{category_id}', response_model=CategoryRead)
async def update_category(category_id: int, obj_in: CategoryUpdate, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = CategoryService(CategoryRepository(db), user_id=user['id'])
    category = await service.update_category(category_id, obj_in)
    if not category:
        raise HTTPException(status_code=404, detail='Category not found')
    return category

@router.delete('/{category_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, user: dict = Depends(get_current_user), db=Depends(get_db)):
    service = CategoryService(CategoryRepository(db), user_id=user['id'])
    success = await service.delete_category(category_id)
    if not success:
        raise HTTPException(status_code=404, detail='Category not found')
    return None
