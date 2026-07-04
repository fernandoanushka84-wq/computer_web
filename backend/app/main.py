import os
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from . import models, schemas
from .database import Base, engine, get_db
from .excel_import import parse_excel_products
from .seed import seed_default_data

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env'))

Base.metadata.create_all(bind=engine)

app = FastAPI(title='Computer Shop API', version='1.0.0')


@app.on_event('startup')
def startup_event():
    seed_default_data()

frontend_origins = [origin.strip() for origin in os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',') if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret')
ALGORITHM = os.getenv('ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '60'))
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='auth/login')


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get('sub')
        if email is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


@app.get('/')
def read_root():
    return {'message': 'Computer Shop API is running'}


@app.post('/auth/register', response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')

    new_user = models.User(
        name=user.name,
        email=str(user.email),
        password_hash=hash_password(user.password),
        phone=user.phone,
        address=user.address,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({'sub': new_user.email})
    return {'access_token': token, 'token_type': 'bearer'}


@app.post('/auth/login', response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == str(payload.email)).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail='Invalid credentials')
    token = create_access_token({'sub': user.email})
    return {'access_token': token, 'token_type': 'bearer'}


@app.get('/auth/me', response_model=schemas.UserOut)
def current_user_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.get('/products', response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).filter(models.Product.is_active.is_(True)).all()


@app.get('/products/{product_id}', response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail='Product not found')
    return product


@app.post('/admin/products', response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Admin access required')
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@app.put('/admin/products/{product_id}', response_model=schemas.ProductOut)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Admin access required')
    existing = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail='Product not found')
    for key, value in product.model_dump().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return existing


@app.delete('/admin/products/{product_id}')
def delete_product(product_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Admin access required')
    existing = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail='Product not found')
    db.delete(existing)
    db.commit()
    return {'message': 'Deleted successfully'}


@app.post('/admin/products/import')
def import_products(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Admin access required')

    rows = parse_excel_products(file.file.read())
    created = 0

    for row in rows:
        category = db.query(models.Category).filter(models.Category.name == row['category_name']).first()
        if not category:
            category = models.Category(name=row['category_name'], description='Imported from Excel')
            db.add(category)
            db.commit()
            db.refresh(category)

        product = models.Product(
            name=row['name'],
            slug=row['slug'] or row['name'].lower().replace(' ', '-'),
            description=row['description'],
            price=row['price'],
            stock_quantity=row['stock_quantity'],
            image_url=row['image_url'],
            category_id=category.id,
            is_featured=row['is_featured'],
            is_active=row['is_active'],
        )
        db.add(product)
        created += 1

    db.commit()
    return {'message': f'Imported {created} products'}


@app.get('/categories', response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@app.post('/admin/categories', response_model=schemas.CategoryOut)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Admin access required')
    new_category = models.Category(**category.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


@app.put('/admin/categories/{category_id}', response_model=schemas.CategoryOut)
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Admin access required')
    existing = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail='Category not found')
    existing.name = category.name
    existing.description = category.description
    db.commit()
    db.refresh(existing)
    return existing


@app.delete('/admin/categories/{category_id}')
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Admin access required')
    existing = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail='Category not found')
    db.delete(existing)
    db.commit()
    return {'message': 'Deleted successfully'}


@app.post('/cart')
def add_to_cart(item: schemas.CartItemBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    existing = db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id, models.CartItem.product_id == item.product_id).first()
    if existing:
        existing.quantity += item.quantity
    else:
        db.add(models.CartItem(user_id=current_user.id, product_id=item.product_id, quantity=item.quantity))
    db.commit()
    return {'message': 'Added to cart'}


@app.get('/cart', response_model=list[schemas.CartItemOut])
def get_cart(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()


@app.post('/orders', response_model=schemas.OrderOut)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    cart_items = db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail='Cart is empty')

    total_amount = 0.0
    for item in cart_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            total_amount += product.price * item.quantity

    new_order = models.Order(user_id=current_user.id, total_amount=total_amount, shipping_address=order.shipping_address)
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for item in cart_items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if product:
            db.add(models.OrderItem(order_id=new_order.id, product_id=product.id, quantity=item.quantity, price=product.price))
    db.query(models.CartItem).filter(models.CartItem.user_id == current_user.id).delete()
    db.commit()
    return new_order


@app.get('/admin/settings')
def get_settings(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Admin access required')
    settings = db.query(models.SiteSetting).all()
    return {item.key_name: item.value for item in settings}


@app.post('/admin/settings')
def save_settings(payload: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail='Admin access required')
    for key, value in payload.items():
        setting = db.query(models.SiteSetting).filter(models.SiteSetting.key_name == key).first()
        if setting:
            setting.value = str(value)
        else:
            db.add(models.SiteSetting(key_name=key, value=str(value)))
    db.commit()
    return {'message': 'Settings updated'}
