import os
import random
from django.core.management.base import BaseCommand
from django.core.files import File
from django.template.defaultfilters import slugify
from django.conf import settings
from products.models import Category, Product
from faker import Faker

class Command(BaseCommand):
    help = 'Seeds the database with initial fashion categories and products, with category-relevant images.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing products and categories before seeding.',
        )

    def handle(self, *args, **options):
        fake = Faker()
        self.stdout.write(self.style.SUCCESS('Starting data seeding...'))

        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing all existing Products and Categories...'))
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing data deleted.'))
        else:
            self.stdout.write(self.style.WARNING('Not clearing existing data. Use --clear to delete all products and categories first.'))

        BASE_SEED_IMAGE_DIR = os.path.join(settings.MEDIA_ROOT, 'seed_images')
        
        categories_map = {
            "Bags": "bags",
            "Dresses": "dresses",
            "Shirts": "shirts",       
            "Pantalons": "pantalons", 
            "Jackets": "jackets",     
            "Skincare": "skincare",
            "Makeup": "makeup",
            "Accessories": "accessories",
            "Shoes": "shoes"          
        }

        created_categories = {}
        for cat_name, folder_name in categories_map.items():
            category, created = Category.objects.get_or_create(name=cat_name)
            created_categories[cat_name] = category
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {category.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Category already exists: {category.name}'))

            cat_image_folder = os.path.join(BASE_SEED_IMAGE_DIR, folder_name)
            if not os.path.exists(cat_image_folder):
                os.makedirs(cat_image_folder)
                self.stdout.write(self.style.WARNING(f'Created image folder: {cat_image_folder}'))
                self.stdout.write(self.style.ERROR(f'Please download 5-10 images for "{cat_name}" and place them in: {cat_image_folder}'))

        category_image_pools = {}
        missing_image_folders = []
        for cat_name, folder_name in categories_map.items():
            cat_image_folder = os.path.join(BASE_SEED_IMAGE_DIR, folder_name)
            image_files = [f for f in os.listdir(cat_image_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp'))]
            if not image_files:
                missing_image_folders.append(cat_name)
            category_image_pools[cat_name] = image_files

        if missing_image_folders:
            self.stdout.write(self.style.ERROR(f'WARNING: No images found for categories: {", ".join(missing_image_folders)}.'))
            self.stdout.write(self.style.ERROR('Products in these categories will be created without images unless you add them to the respective subfolders.'))
            self.stdout.write(self.style.ERROR('Please add images to proceed correctly.'))

        num_products_per_category = 10
        total_products_created = 0

        for cat_name in categories_map.keys():
            category_obj = created_categories.get(cat_name)
            
            for i in range(num_products_per_category):
                base_name = fake.word().capitalize()
                product_type = cat_name 
                
                if product_type == "Bags": product_type_singular = "Bag"
                elif product_type == "Dresses": product_type_singular = "Dress"
                elif product_type == "Shirts": product_type_singular = "Shirt"
                elif product_type == "Pantalons": product_type_singular = "Pantalon" 
                elif product_type == "Jackets": product_type_singular = "Jacket"
                elif product_type == "Skincare": product_type_singular = "Skincare Item" 
                elif product_type == "Makeup": product_type_singular = "Makeup Item"
                elif product_type == "Accessories": product_type_singular = "Accessory"
                elif product_type == "Shoes": product_type_singular = "Shoe"
                else: product_type_singular = product_type 


                product_name = f"{base_name} {fake.color_name().capitalize()} {product_type_singular} {i+1}"
                
                product_description = fake.paragraph(nb_sentences=3)
                product_price = round(random.uniform(10.0, 500.0), 2)
                product_stock = random.randint(10, 200)

                product, created = Product.objects.get_or_create(
                    name=product_name,
                    defaults={
                        "category": category_obj,
                        "description": product_description,
                        "price": product_price,
                        "stock": product_stock,
                    }
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created product: {product.name}'))
                    total_products_created += 1
                    
                    available_images = category_image_pools.get(cat_name)
                    if available_images: 
                        random_image_filename = random.choice(available_images)
                        image_path_full = os.path.join(BASE_SEED_IMAGE_DIR, categories_map[cat_name], random_image_filename)
                        
                        try:
                            with open(image_path_full, 'rb') as f:
                                product.image.save(random_image_filename, File(f), save=False)
                            product.save()
                            self.stdout.write(self.style.SUCCESS(f'Assigned image {random_image_filename} for {product.name}'))
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f'Error assigning image {random_image_filename} for {product.name}: {e}'))
                    else:
                        self.stdout.write(self.style.WARNING(f'No images found for category "{cat_name}". Product {product.name} created without image.'))
                else:
                    self.stdout.write(self.style.WARNING(f'Product already exists: {product.name} - Skipping.'))

        self.stdout.write(self.style.SUCCESS(f'Data seeding complete! Total new products created: {total_products_created}'))