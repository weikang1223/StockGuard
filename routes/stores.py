from flask import render_template, jsonify, request, Response
from database import database
import json
from decimal import Decimal

def init_store_routes(app):
    @app.route('/stores')
    def stores():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Retrieve all stores along with their product counts
            cursor.execute('''
                SELECT s.store_id, s.store_name, s.location, 
                       COUNT(DISTINCT p.product_id) AS product_count 
                FROM stores s 
                LEFT JOIN products p ON s.store_id = p.store_id 
                GROUP BY s.store_id, s.store_name, s.location
            ''')
            stores = cursor.fetchall()
            
            # Fetch unique locations for the filter dropdown
            cursor.execute('SELECT DISTINCT location FROM stores ORDER BY location')
            locations = [row['location'] for row in cursor.fetchall()]
            
            return render_template('stores.html', stores=stores, locations=locations)
        except Exception as e:
            print(f"Error retrieving stores: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
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

    @app.route('/stores/<int:id>', methods=['PUT'])
    def update_store(id):
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''
                UPDATE stores
                SET store_name = %s,
                    location = %s
                WHERE store_id = %s
            ''', (data['store_name'], data['location'], id))

            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'Store not found'}), 404

            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error updating store: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/stores/<int:id>', methods=['DELETE'])
    def delete_store(id):
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
    
            cursor.execute('DELETE FROM stores WHERE store_id = %s', (id,)) 
            if cursor.rowcount == 0:
                 return jsonify({'success': False, 'message': 'Store not found'}), 404
            
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error deleting store: {str(e)}")
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
                    p.product_name,
                    p.quantity,
                    c.categories_name,
                    p.price     
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.store_id = %s
            ''', (store_id,))  # Fixed tuple here

            products = cursor.fetchall()
         #   print(f"Products for store {store_id}: {products}")

            # Convert Decimal to float
            def default_serializer(obj):
                if isinstance(obj, Decimal):
                    return float(obj)
                raise TypeError

            return Response(json.dumps(products, default=default_serializer), mimetype='application/json')
        except Exception as e:
            print(f"Error retrieving products for store {store_id}: {str(e)}")
            return jsonify({'error': str(e)}), 500
        finally:
            cursor.close()
            conn.close()
