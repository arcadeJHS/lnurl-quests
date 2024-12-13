from fastapi import FastAPI
from resources.health import router as health_router
from resources.items import router as items_router
from resources.glclient import router as glclient_router

app = FastAPI()

app.include_router(health_router)
app.include_router(items_router)
app.include_router(glclient_router)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=5000)