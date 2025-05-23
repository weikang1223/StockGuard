from flask import render_template, jsonify, request, Response,session,redirect,url_for
from database import database
import json
from decimal import Decimal

def init_store_routes(app):
    @app.route('/stores')
    def stores():
        if session.get('role') != 'manager':
            return redirect(url_for('user_stores'))
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Retrieve all stores along with their product counts
            cursor.execute('''
                SELECT s.store_id, s.store_name, s.location, 
                       COUNT(DISTINCT p.product_id) AS product_count
                        ,u.username
                FROM stores s 
                LEFT JOIN products p ON s.store_id = p.store_id 
                LEFT JOIN users u ON s.store_id = u.store_id
                GROUP BY s.store_id, s.store_name, s.location,u.username
            ''')
            stores = cursor.fetchall()
            
            # Fetch unique locations for the filter dropdown
            cursor.execute('SELECT DISTINCT location FROM stores ORDER BY location')
            locations = [row['location'] for row in cursor.fetchall()]

            username = session.get('username')
            
            return render_template('Manager_role/stores.html', stores=stores, locations=locations, username=username)
        except Exception as e:
            print(f"Error retrieving stores: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/stores', methods=['POST'])
    def add_store():
        if session.get('role') != 'manager':
            return redirect(url_for('user_stores'))
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
        if session.get('role') != 'manager':
            return redirect(url_for('user_stores'))
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
        if session.get('role') != 'manager':
            return redirect(url_for('user_stores'))
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
        if session.get('role') != 'manager':
            return redirect(url_for('user_stores'))
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''
                SELECT 
                p.product_name,
                p.quantity,
                c.categories_name,
                p.price,
                s.company_name AS supplier_name,
                s.contact_name AS supplier_contact_person,
                s.phone AS supplier_phone,
                s.email AS supplier_email     
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
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

    @app.route('/user_stores')
    def user_stores():
        
        if session.get('role') != 'store admin':
            return redirect(url_for('stores'))
        
        try:
            store_id = session.get('store_id')
           # print(f"Store ID from session: {store_id}")

            if not store_id:
                return jsonify({'error': 'Store not associated with user'}), 400
        
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Retrieve all stores along with their product counts
            cursor.execute('''
               SELECT 
                   s.store_id, 
                   s.store_name, 
                   s.location, 
                   COUNT(DISTINCT p.product_id) AS product_count,
                   u.username
               FROM stores s 
               LEFT JOIN users u on s.store_id = u.store_id
               LEFT JOIN products p ON s.store_id = p.store_id 
               WHERE  s.store_id = %s
               GROUP BY s.store_id, s.store_name, s.location,u.username
            ''', (store_id,))
            stores = cursor.fetchall()
            
            # Fetch unique locations for the filter dropdown
            cursor.execute('SELECT DISTINCT location FROM stores WHERE store_id = %s', (store_id,))
            locations = [row['location'] for row in cursor.fetchall()]

            username = session.get('username')
            
            return render_template('Admin_Role/user_stores.html', stores=stores, locations=locations, username=username)
        except Exception as e:
            print(f"Error retrieving stores: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/user_stores/<int:store_id>/products')
    def get_store_user_products(store_id):
        if session.get('role') != 'store admin':
            return redirect(url_for('stores'))
        try:
            store_id = session.get('store_id')
            print(f"Store ID from session: {store_id}")

            if not store_id:
                return jsonify({'error': 'Store not associated with user'}), 400
            
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
