from flask import render_template, jsonify, request
from database import database

def init_product_routes(app):
    @app.route('/products')
    def products():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            # Get all products with full join info
            cursor.execute('''
                SELECT p.product_id, p.product_name, p.quantity, p.price, 
                       c.categories_name as category_name, c.id as category_id,
                       s.company_name as supplier_name, s.id as supplier_id,
                       st.store_name, st.store_id
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN stores st ON p.store_id = st.store_id
            ''')
            all_products = cursor.fetchall()

            # Get filter inputs
            search = request.args.get('search', '').lower()
            store_id = request.args.get('store_id', '')

            # Apply filters
            if search or store_id:
                filtered_products = []
                for product in all_products:
                    matches_search = (
                        not search or
                        search in product['product_name'].lower() or
                        search in product['category_name'].lower() or
                        search in product['supplier_name'].lower()
                    )
                    matches_store = not store_id or str(product['store_id']) == store_id

                    if matches_search and matches_store:
                        filtered_products.append(product)

                products = filtered_products
            else:
                products = all_products

            # Get categories
            cursor.execute('SELECT id, categories_name FROM categories')
            categories = cursor.fetchall()

            # Get suppliers
            cursor.execute('SELECT id, company_name FROM suppliers')
            suppliers = cursor.fetchall()

            # Get stores
            cursor.execute('SELECT store_id, store_name FROM stores')
            stores = cursor.fetchall()

            return render_template(
                'products.html',
                products=products,
                categories=categories,
                suppliers=suppliers,
                stores=stores
            )

        finally:
            cursor.close()
            conn.close()


    @app.route('/products', methods=['POST'])
    def add_product():
        try:
            data = request.get_json()
            print(f"Received data: {data}")  # Debug: Log received data
            
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                INSERT INTO products (product_name, category_id, supplier_id,store id, quantity, price) 
                VALUES (%s, %s, %s, %s, %s,%s )
            ''', (
                data['product_name'],
                data['category_id'],
                data['supplier_id'],
                data['store_id'],
                data['quantity'],
                data['price']
            ))
            
            conn.commit()
            print("Product added successfully")  # Debug: Log success
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error adding product: {str(e)}")  # Debug: Log error
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
            
            # Start transaction
            cursor.execute('START TRANSACTION')
            
            # Update products table
            cursor.execute('''
                UPDATE products 
                SET product_name = %s, 
                    category_id = %s,
                    supplier_id = %s, 
                    store_id = %s,
                    quantity = %s, 
                    price = %s 
                WHERE product_id = %s
            ''', (
                data['product_name'],
                data['category_id'],
                data['supplier_id'],
                data['store_id'],
                data['quantity'],
                data['price'],
                id
            ))
            
            if cursor.rowcount == 0:
                cursor.execute('ROLLBACK')
                return jsonify({'success': False, 'message': 'Product not found'}), 404
            
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            if 'conn' in locals():
                cursor.execute('ROLLBACK')
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