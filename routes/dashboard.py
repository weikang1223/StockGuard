from flask import render_template, request, redirect, url_for, session, jsonify
from database import database

def init_dashboard_routes(app):
    @app.route('/dashboard')
    def dashboard():
        if session.get('role') != 'manager':
            return redirect(url_for('user_dashboard'))  # Block non-managers

        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('SELECT store_id, store_name FROM stores')
            stores = cursor.fetchall()

            cursor.execute('SELECT COUNT(*) as total_products FROM products')
            total_products = cursor.fetchone()['total_products']

            cursor.execute('SELECT SUM(quantity * price) as total_value FROM products')
            total_value = cursor.fetchone()['total_value'] or 0

            cursor.execute('SELECT COUNT(*) as low_stock FROM products WHERE quantity <= 10')
            low_stock = cursor.fetchone()['low_stock']

            username = session.get('username')

            return render_template('Manager_role/dashboard.html',
                                    username=username,
                                    stores=stores,
                                    total_products=total_products,
                                    total_value=total_value,
                                    low_stock=low_stock)
        finally:
            cursor.close()
            conn.close()

    @app.route('/dashboard/low-stock')
    def get_low_stock_items():
        if session.get('role') != 'manager':
            return jsonify({"error": "Unauthorized"}), 403

        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''SELECT p.product_id, p.product_name, p.quantity, s.company_name as supplier_name,
                            s.contact_name as supplier_contact_person, s.phone as supplier_phone, s.email as supplier_email
                            FROM products p
                            LEFT JOIN suppliers s ON p.supplier_id = s.id
                            WHERE p.quantity <= 10 ORDER BY p.quantity ASC''')

            return jsonify(cursor.fetchall())
        finally:
            cursor.close()
            conn.close()

    @app.route('/dashboard/top-products/')
    def get_top_products():
        if session.get('role') != 'manager':
            return jsonify({"error": "Unauthorized"}), 403

        store_id = request.args.get('store_id')

        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''SELECT product_name, quantity 
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
        if session.get('role') != 'manager':
            return jsonify({"error": "Unauthorized"}), 403

        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''SELECT p.product_name, p.quantity, s.store_name as store_name
                            FROM products p
                            LEFT JOIN stores s ON p.store_id = s.store_id
                            WHERE p.quantity <= 10  
                            ORDER BY p.quantity ASC
            ''')
            return jsonify(cursor.fetchall())
        finally:
            cursor.close()
            conn.close()

    @app.route('/user_dashboard')
    def user_dashboard():
        if session.get('role') != 'store admin':
            return redirect(url_for('dashboard'))  # Block non-store admins

        store_id = session.get('store_id')
        if not store_id:
            return redirect(url_for('login_page'))

        conn = database.get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute('SELECT store_name FROM stores WHERE store_id = %s', (store_id,))
        store_row = cursor.fetchone()
        store_name = store_row['store_name'] if store_row else 'Unknown Store'

        cursor.execute('SELECT COUNT(*) as total_products FROM products WHERE store_id = %s', (store_id,))
        total_products = cursor.fetchone()['total_products']

        cursor.execute('SELECT SUM(quantity * price) as total_value FROM products WHERE store_id = %s', (store_id,))
        total_value = cursor.fetchone()['total_value'] or 0

        cursor.execute('SELECT COUNT(*) as low_stock FROM products WHERE store_id = %s AND quantity <= 10', (store_id,))
        low_stock = cursor.fetchone()['low_stock']

        cursor.execute('''SELECT product_name, quantity 
                          FROM products 
                          WHERE store_id = %s 
                          ORDER BY quantity DESC 
                          LIMIT 5
        ''', (store_id,))
        top_products = cursor.fetchall()

        username = session.get('username')

        return render_template('Admin_Role/user_dashboard.html',
                               store_name = store_name,
                               total_products=total_products,
                               total_value=total_value,
                               low_stock=low_stock,
                               top_products=top_products,
                               username=username)

    @app.route('/user_dashboard/top-products-user')
    def get_user_top_products():
        if session.get('role') != 'store admin':
            return jsonify({"error": "Unauthorized"}), 403

        store_id = session.get('store_id')
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''SELECT product_name, quantity 
                              FROM products 
                              WHERE store_id = %s 
                              ORDER BY quantity DESC 
                              LIMIT 5
            ''', (store_id,))
            return jsonify(cursor.fetchall())
        finally:
            cursor.close()
            conn.close()

    @app.route('/user_dashboard/low-stock')
    def get_user_dashboard_low_stock_items():
        if session.get('role') != 'store admin':
            return jsonify({"error": "Unauthorized"}), 403

        store_id = session.get('store_id')
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                '''SELECT p.product_id, p.product_name, p.quantity, 
                          s.company_name AS supplier_name,
                          s.contact_name AS supplier_contact_person, 
                          s.phone AS supplier_phone, 
                          s.email AS supplier_email
                   FROM products p
                   LEFT JOIN suppliers s ON p.supplier_id = s.id
                   WHERE p.store_id = %s AND p.quantity <= 10 
                   ORDER BY p.quantity ASC''', 
                (store_id,)
            )
            return jsonify(cursor.fetchall())
        finally:
            cursor.close()
            conn.close()

    @app.route('/user_dashboard/low-stock-chart')
    def get_user_low_stock_chart():
        if session.get('role') != 'store admin':
            return jsonify({"error": "Unauthorized"}), 403

        store_id = session.get('store_id')
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''SELECT p.product_name, p.quantity, s.store_name as store_name
                              FROM products p
                              LEFT JOIN stores s ON p.store_id = s.store_id
                              WHERE p.quantity <= 10 AND p.store_id = %s
                              ORDER BY p.quantity ASC
            ''', (store_id,))
            return jsonify(cursor.fetchall())
        finally:
            cursor.close()
            conn.close()
