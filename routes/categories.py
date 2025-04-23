from flask import render_template, jsonify, request,session
from database import database

def init_category_routes(app):
    @app.route('/categories')
    def categories():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT id, categories_name FROM categories')
            categories = cursor.fetchall()
            username = session.get('username')
            return render_template('categories.html', categories=categories, username=username)
        finally:
            cursor.close()
            conn.close()

    @app.route('/categories', methods=['POST'])
    def add_category():
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