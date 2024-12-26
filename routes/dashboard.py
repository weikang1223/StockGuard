from flask import render_template, jsonify
from database import database

def init_dashboard_routes(app):
    @app.route('/dashboard')
    def dashboard():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Get total number of products
            cursor.execute('SELECT COUNT(*) as total_products FROM products')
            total_products = cursor.fetchone()['total_products']
            
            # Get total value of all products
            cursor.execute('SELECT SUM(quantity * price) as total_value FROM products')
            total_value = cursor.fetchone()['total_value'] or 0
            
            # Get low stock items count
            cursor.execute('SELECT COUNT(*) as low_stock FROM products WHERE quantity < 10')
            low_stock = cursor.fetchone()['low_stock']
            
            return render_template('dashboard.html', 
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
                    s.supplier_contact_person,
                    s.phone as supplier_phone,
                    s.email as supplier_email
                FROM products p
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.quantity < 10
                ORDER BY p.quantity ASC
            ''')
            
            low_stock_items = cursor.fetchall()
            return jsonify(low_stock_items)
        finally:
            cursor.close()
            conn.close() 