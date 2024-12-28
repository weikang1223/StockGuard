from flask import render_template, jsonify, request
from database import database

def init_store_routes(app):
    @app.route('/stores')
    def stores():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                SELECT s.store_id, s.store_name, s.location, COUNT(p.product_id) as product_count 
                FROM stores s 
                LEFT JOIN store_products p ON s.store_id = p.store_id 
                GROUP BY s.store_id, s.store_name, s.location
            ''')
            stores = cursor.fetchall()
            return render_template('stores.html', stores=stores)
        finally:
            cursor.close()
            conn.close()

    @app.route('/stores', methods=['POST'])
    def add_store():
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('INSERT INTO stores (store_name, location) VALUES (%s, %s)', 
                         (data['store_name'], data['location']))
            conn.commit()
            
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error adding store: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/stores/transfer', methods=['POST'])
    def transfer_products():
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Start transaction
            cursor.execute('START TRANSACTION')
            
            # Check if source store has enough quantity
            cursor.execute('''
                SELECT quantity FROM store_products 
                WHERE store_id = %s AND product_id = %s
            ''', (data['from_store'], data['product_id']))
            
            source_qty = cursor.fetchone()
            if not source_qty or source_qty['quantity'] < int(data['quantity']):
                cursor.execute('ROLLBACK')
                return jsonify({
                    'success': False, 
                    'message': 'Insufficient quantity in source store'
                }), 400
            
            # Reduce quantity from source store
            cursor.execute('''
                UPDATE store_products 
                SET quantity = quantity - %s 
                WHERE store_id = %s AND product_id = %s
            ''', (data['quantity'], data['from_store'], data['product_id']))
            
            # Add quantity to destination store
            cursor.execute('''
                INSERT INTO store_products (store_id, product_id, quantity)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE quantity = quantity + %s
            ''', (data['to_store'], data['product_id'], data['quantity'], data['quantity']))
            
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            if 'conn' in locals():
                cursor.execute('ROLLBACK')
            print(f"Error transferring products: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close() 

    @app.route('/stores/<int:store_id>/products')
    def get_store_products(store_id):
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                SELECT 
                    sp.product_id, 
                    p.product_name, 
                    sp.quantity,
                    p.price,
                    c.categories_name as category_name,
                    s.company_name as supplier_name,
                    s.supplier_contact_person,
                    s.phone as supplier_phone,
                    s.email as supplier_email
                FROM store_products sp
                JOIN products p ON sp.product_id = p.product_id
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE sp.store_id = %s AND sp.quantity > 0
            ''', (store_id,))
            
            products = cursor.fetchall()
            return jsonify(products)
        except Exception as e:
            print(f"Error fetching store products: {str(e)}")
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            conn.close() 

