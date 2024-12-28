from flask import render_template, jsonify, request
from database import database

def init_product_routes(app):
    @app.route('/products')
    def products():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Get products with category names
            cursor.execute('''
                SELECT p.product_id, p.product_name, p.quantity, p.price, 
                       p.category_id, c.categories_name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
            ''')
            products = cursor.fetchall()
            
            # Get categories for the dropdown
            cursor.execute('SELECT id, categories_name FROM categories')
            categories = cursor.fetchall()
            
            return render_template('products.html', products=products, categories=categories)
        finally:
            cursor.close()
            conn.close()

    @app.route('/products', methods=['POST'])
    def add_product():
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                INSERT INTO products (product_name, category_id, quantity, price) 
                VALUES (%s, %s, %s, %s)
            ''', (
                data['product_name'],
                data['category_id'],
                data['quantity'],
                data['price']
            ))
            
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error adding product: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/products/<int:id>', methods=['PUT'])
    def update_product(id):
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                UPDATE products 
                SET product_name = %s, 
                    category_id = %s, 
                    quantity = %s, 
                    price = %s 
                WHERE product_id = %s
            ''', (
                data['product_name'],
                data['category_id'],
                data['quantity'],
                data['price'],
                id
            ))
            
            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'Product not found'}), 404
                
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error updating product: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/products/<int:id>', methods=['DELETE'])
    def delete_product(id):
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('DELETE FROM products WHERE product_id = %s', (id,))
            
            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'Product not found'}), 404
                
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error deleting product: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close() 