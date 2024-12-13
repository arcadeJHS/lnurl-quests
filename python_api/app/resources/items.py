from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# In-memory storage for demo purposes
items = {}

class Item(BaseModel):
    name: str
    description: str = ""

class ItemUpdate(BaseModel):
    name: str = None
    description: str = None

@router.get("/items")
def get_items():
    idx = str(len(items) + 1)
    items[idx] = {'name': 'Item 1', 'description': 'Item 1 description'}
    return list(items.values())

@router.post("/items", status_code=201)
def create_item(item: Item):
    item_id = str(len(items) + 1)
    items[item_id] = item.dict()
    items[item_id]['id'] = item_id
    return items[item_id]

@router.get("/items/{item_id}")
def get_item(item_id: str):
    item = items.get(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/items/{item_id}")
def update_item(item_id: str, item_update: ItemUpdate):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    item = items[item_id]
    if item_update.name is not None:
        item['name'] = item_update.name
    if item_update.description is not None:
        item['description'] = item_update.description
    return item

@router.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: str):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    del items[item_id]
    return