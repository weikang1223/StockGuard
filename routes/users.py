from flask import render_template, jsonify, request
from database import database

def init_user_routes(app):
    @app.route('/users')
    def users():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT id, username, role FROM users')
            users = cursor.fetchall()
            return render_template('users.html', users=users)
        finally:
            cursor.close()
            conn.close()

    @app.route('/users', methods=['POST'])
    def add_user():
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''
                INSERT INTO users (username, password, role) 
                VALUES (%s, %s, %s)
            ''', (
                data['username'],
                data['password'],  # Consider hashing in production
                data['role']
            ))

            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error adding user: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/users/<int:id>', methods=['PUT'])
    def update_user(id):
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''
                UPDATE users 
                SET username = %s,
                    password = %s,
                    role = %s
                WHERE id = %s
            ''', (
                data['username'],
                data['password'],
                data['role'],
                id
            ))

            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'User not found'}), 404

            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error updating user: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/users/<int:id>', methods=['DELETE'])
    def delete_user(id):
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('DELETE FROM users WHERE id = %s', (id,))

            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'User not found'}), 404

            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error deleting user: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()