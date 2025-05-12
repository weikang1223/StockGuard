from flask import render_template, jsonify, request,session, redirect,url_for,json,Response
from database import database

def init_category_routes(app):
    @app.route('/categories')
    def categories():
        if session.get('role') != 'manager':
            return redirect(url_for('user_categories'))
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT id, categories_name FROM categories')
            categories = cursor.fetchall()
            username = session.get('username')
            return render_template('Manager_role/categories.html', categories=categories, username=username)
        finally:
            cursor.close()
            conn.close()

    @app.route('/categories', methods=['POST'])
    def add_category():
        if session.get('role') != 'manager':
            return redirect(url_for('user_categories'))
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                INSERT INTO categories (categories_name) 
                VALUES (%s)
            ''', (data['categories_name'],))
            
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error adding category: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/categories/<int:id>', methods=['PUT'])
    def update_category(id):
        if session.get('role') != 'manager':
            return redirect(url_for('user_categories'))
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                UPDATE categories 
                SET categories_name = %s
                WHERE id = %s
            ''', (data['categories_name'], id))
            
            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'Category not found'}), 404
                
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error updating category: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/categories/<int:id>', methods=['DELETE'])
    def delete_category(id):
        if session.get('role') != 'manager':
            return redirect(url_for('user_categories'))
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('DELETE FROM categories WHERE id = %s', (id,))
            
            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'Category not found'}), 404
                
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error deleting category: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/categories/<int:id>', methods=['GET'])
    def get_category_inventory(id):
        if session.get('role') != 'manager':
            return redirect(url_for('user_categories'))
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            # The SQL query
            cursor.execute('''
                SELECT 
                    s.store_name,
                    p.product_name,
                    p.quantity
                FROM 
                    products p
                JOIN 
                    stores s ON p.store_id = s.store_id
                JOIN 
                    categories c ON p.category_id = c.id
                WHERE 
                    c.id = %s
            ''', (id,))

            products = cursor.fetchall()


            return Response(json.dumps(products), mimetype='application/json')

        except Exception as e:
            print(f"Error retrieving inventory for category {id}: {str(e)}")
            return jsonify({'error': str(e)}), 500

        finally:
            cursor.close()
            conn.close()


    @app.route('/user_categories')
    def user_categories():
        if session.get('role') != 'store admin':
            return redirect(url_for('categories'))
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT id, categories_name FROM categories')
            categories = cursor.fetchall()
            username = session.get('username')
            return render_template('Admin_Role/user_categories.html', categories=categories, username=username)
        finally:
            cursor.close()
            conn.close()

    @app.route('/user_categories', methods=['POST'])
    def add_user_category():
        if session.get('role') != 'store admin':
            return redirect(url_for('categories'))
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                INSERT INTO categories (categories_name) 
                VALUES (%s)
            ''', (data['categories_name'],))
            
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error adding category: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()        