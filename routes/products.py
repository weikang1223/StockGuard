from flask import render_template, jsonify, request
from database import database
from datetime import datetime

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
            
        except Exception as e:
            print(f"Error in products route: {str(e)}")
            return jsonify({'error': str(e)}), 500
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
            
            # Start transaction
            cursor.execute('START TRANSACTION')
            
            # Insert the product
            cursor.execute('''
                INSERT INTO products 
                (product_name, category_id, supplier_id, store_id, quantity, price) 
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                data['product_name'],
                data['category_id'],
                data['supplier_id'],
                data['store_id'],
                data['quantity'],
                data['price']
            ))
            
            # Get the inserted product ID
            product_id = cursor.lastrowid
            
            # Record stock in transaction if store_id is provided
            if data.get('store_id'):
                # For stock in, we'll use store_id 0 as the source (external source)
                cursor.execute('''
                    INSERT INTO product_transactions 
                    (product_id, quantity, transaction_date, transaction_type,created_by) 
                    VALUES (%s, %s, %s, %s,%s)
                ''', (
                    product_id,
                    data['quantity'],
                    data.get('date', datetime.now()), # Use provided date 
                    'in', 
                    1  # Using user ID 1 as default
                ))
            
            conn.commit()
            print("Product added successfully")  # Debug: Log success
            return jsonify({'success': True})
        except Exception as e:
            if 'conn' in locals():
                cursor.execute('ROLLBACK')
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
            
    @app.route('/products/stock-out', methods=['POST'])
    def stock_out():
       try:
           data = request.get_json()
           product_id = data.get('product_id')
           quantity = data.get('quantity')
           date = data.get('date')
           
           if not all([product_id, quantity, date]):
               return jsonify({'success': False, 'message': 'Missing required fields'}), 400
               
           conn = database.get_connection()
           cursor = conn.cursor(dictionary=True)
           
           cursor.execute('START TRANSACTION')
           
           cursor.execute('SELECT quantity FROM products WHERE product_id = %s', (product_id,))
           product = cursor.fetchone()
           
           if not product:
               cursor.execute('ROLLBACK')
               return jsonify({'success': False, 'message': 'Product not found'}), 404
               
           if product['quantity'] < int(quantity):
               cursor.execute('ROLLBACK')
               return jsonify({'success': False, 'message': 'Insufficient quantity in stock'}), 400
           
           new_quantity = product['quantity'] - int(quantity)
           cursor.execute('UPDATE products SET quantity = %s WHERE product_id = %s', (new_quantity, product_id))
           
           cursor.execute('INSERT INTO product_transactions (product_id, quantity, transaction_date, transaction_type,created_by) VALUES (%s, %s, %s, %s,%s)', 
            (product_id, quantity, date,'Out',1))
           
           conn.commit()
           return jsonify({'success': True, 'message': 'Stock out recorded successfully'})
       except Exception as e:
           if 'conn' in locals():
               cursor.execute('ROLLBACK')
           print(f"Error recording stock out: {str(e)}")
           return jsonify({'success': False, 'message': str(e)}), 500
       finally:
           cursor.close()
           conn.close()

            
    @app.route('/products/transactions')
    def get_transactions():
      try:
          conn = database.get_connection()
          cursor = conn.cursor(dictionary=True)
          
          cursor.execute('''
              SELECT 
                  pt.transaction_id,
                  pt.product_id,
                  p.product_name,
                  pt.quantity,
                  pt.transaction_date,
                  pt.transaction_type,
                  u.username AS created_by
              FROM product_transactions pt
              JOIN products p ON pt.product_id = p.product_id
              JOIN users u ON pt.created_by = u.id
              ORDER BY pt.transaction_date DESC
          ''')
          
          transactions = cursor.fetchall()
          return render_template('transactions.html', transactions=transactions)
      except Exception as e:
          print(f"Error fetching transactions: {e}")
          return jsonify({'error': str(e)}), 500
      finally:
          cursor.close()
          conn.close()
