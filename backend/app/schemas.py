from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    stock_quantity: int = 0
    image_url: Optional[str] = None
    category_id: int
    is_featured: bool = False
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductOut(ProductBase):
    id: int

    class Config:
        from_attributes = True


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemOut(CartItemBase):
    id: int

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    shipping_address: str


class OrderOut(BaseModel):
    id: int
    total_amount: float
    status: str
    shipping_address: Optional[str]

    class Config:
        from_attributes = True


class SiteSettingOut(BaseModel):
    key_name: str
    value: Optional[str]

    class Config:
        from_attributes = True
