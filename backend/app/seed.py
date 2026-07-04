import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from .database import SessionLocal
from . import models

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env'))


def seed_default_data():
    db: Session = SessionLocal()
    try:
        from .main import hash_password

        admin = db.query(models.User).filter(models.User.email == 'admin@computerhub.com').first()
        if not admin:
            db.add(models.User(name='Admin', email='admin@computerhub.com', password_hash=hash_password('Admin@1234'), is_admin=True))

        categories = [
            {'name': 'Laptops', 'description': 'Gaming, business and creator laptops'},
            {'name': 'Desktops', 'description': 'High performance desktop PCs'},
            {'name': 'Processors', 'description': 'CPU options for every build'},
            {'name': 'Graphics Cards', 'description': 'Gaming and rendering GPUs'},
            {'name': 'Storage', 'description': 'SSD and HDD solutions'},
            {'name': 'Accessories', 'description': 'Peripherals and accessories'},
        ]
        for category_data in categories:
            existing = db.query(models.Category).filter(models.Category.name == category_data['name']).first()
            if not existing:
                db.add(models.Category(**category_data))

        products = [
            {
                'name': 'Gaming Laptop Pro',
                'slug': 'gaming-laptop-pro',
                'description': 'High-performance gaming laptop with RGB keyboard.',
                'price': 1399000,
                'stock_quantity': 12,
                'image_url': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80',
                'category_id': 1,
                'is_featured': True,
                'is_active': True,
            },
            {
                'name': 'Creator Desktop',
                'slug': 'creator-desktop',
                'description': 'Powerful workstation desktop for creators.',
                'price': 1245000,
                'stock_quantity': 8,
                'image_url': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
                'category_id': 2,
                'is_featured': True,
                'is_active': True,
            },
            {
                'name': 'RTX 4070 GPU',
                'slug': 'rtx-4070-gpu',
                'description': 'Next-gen graphics card for ultra settings.',
                'price': 749000,
                'stock_quantity': 15,
                'image_url': 'https://images.unsplash.com/photo-1587202372614-c3f3d0f8f0b2?auto=format&fit=crop&w=900&q=80',
                'category_id': 4,
                'is_featured': True,
                'is_active': True,
            },
            {
                'name': '1TB NVMe SSD',
                'slug': '1tb-nvme-ssd',
                'description': 'Fast storage solution for gaming and work.',
                'price': 179000,
                'stock_quantity': 30,
                'image_url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
                'category_id': 5,
                'is_featured': False,
                'is_active': True,
            },
            {
                'name': 'Mechanical Keyboard',
                'slug': 'mechanical-keyboard',
                'description': 'RGB mechanical keyboard for pro setup.',
                'price': 89000,
                'stock_quantity': 20,
                'image_url': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
                'category_id': 6,
                'is_featured': False,
                'is_active': True,
            },
        ]
        for product_data in products:
            existing = db.query(models.Product).filter(models.Product.slug == product_data['slug']).first()
            if not existing:
                db.add(models.Product(**product_data))

        settings = [
            ('shop_name', 'Nova Computer Hub'),
            ('whatsapp_number', '+94740620137'),
            ('hero_title', 'Premium PC Hardware & Gaming Gear'),
            ('hero_subtitle', 'Discover high-performance computers and components crafted for creators, gamers, and professionals.'),
            ('footer_text', 'Trusted computer parts and custom builds in Sri Lanka.'),
        ]
        for key_name, value in settings:
            existing = db.query(models.SiteSetting).filter(models.SiteSetting.key_name == key_name).first()
            if not existing:
                db.add(models.SiteSetting(key_name=key_name, value=value))

        db.commit()
    finally:
        db.close()
