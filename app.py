# app.py
from flask import Flask, render_template, redirect, url_for
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key'# Needed for flash messages


# Sample static data
products = [
    {
        'id': 1,
        'name': 'Laptop',
        'quantity': 15,
        'price': 999.99,
        'category': 'Electronics',
        'date_added': datetime(2024, 3, 15)
    },
    {
        'id': 2,
        'name': 'Smartphone',
        'quantity': 25,
        'price': 599.99,
        'category': 'Electronics',
        'date_added': datetime(2024, 3, 16)
    }
]


@app.route('/')
def dashboard():
    total_products = len(products)
    total_value = sum(product['quantity'] * product['price'] for product in products)
    low_stock = len([p for p in products if p['quantity'] < 10])

    return render_template('dashboard.html',
                           total_products=total_products,
                           total_value=total_value,
                           low_stock=low_stock,
                           recent_products=products[-5:])


@app.route('/products')
def view_products():
    return render_template('products.html', products=products)


if __name__ == '__main__':
    app.run(debug=True)