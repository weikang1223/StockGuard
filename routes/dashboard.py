from flask import render_template, request, jsonify
from database import database

def init_dashboard_routes(app):
    @app.route('/dashboard')
    def dashboard():
        try:         
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            # Get all stores for filter dropdown
            cursor.execute('SELECT store_id, store_name FROM stores')
            stores = cursor.fetchall()

            # Default stats (total from all stores)
            cursor.execute('SELECT COUNT(*) as total_products FROM products')
            total_products = cursor.fetchone()['total_products']

            cursor.execute('SELECT SUM(quantity * price) as total_value FROM products')
            total_value = cursor.fetchone()['total_value'] or 0

            cursor.execute('SELECT COUNT(*) as low_stock FROM products WHERE quantity <= 10')
            low_stock = cursor.fetchone()['low_stock']

            return render_template('dashboard.html',
                                   stores=stores,
                                   total_products=total_products,
                                   total_value=total_value,
                                   low_stock=low_stock)
        finally:
            cursor.close()
            conn.close()

    @app.route('/dashboard/low-stock')
    def get_low_stock_items():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''
                SELECT 
                    p.product_id,
                    p.product_name,
                    p.quantity,
                    s.company_name as supplier_name,
                    s.contact_name as supplier_contact_person,
                    s.phone as supplier_phone,
                    s.email as supplier_email
                FROM products p
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.quantity <= 10
                ORDER BY p.quantity ASC
            ''')

            return jsonify(cursor.fetchall())
        finally:
            cursor.close()
            conn.close()

    @app.route('/dashboard/top-products/')
    def get_top_products():
        store_id = request.args.get('store_id')

        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''
                SELECT product_name, quantity 
                FROM products 
                WHERE store_id = %s 
                ORDER BY quantity DESC 
                LIMIT 6
            ''', (store_id,))
            products = cursor.fetchall()
            return jsonify(products)
        finally:
            cursor.close()
            conn.close()


    @app.route('/dashboard/low-stock-chart')
    def low_stock_chart():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''
                SELECT 
                    p.product_name, p.quantity, s.store_name as store_name
                    FROM products p
                    LEFT JOIN stores s ON p.store_id = s.store_id
                    WHERE p.quantity <= 10  
                    ORDER BY p.quantity ASC
             ''')

            low_stock_item = cursor.fetchall()
            return jsonify(low_stock_item)

        finally:
            cursor.close()
            conn.close()


