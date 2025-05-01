from flask import Flask, render_template, jsonify, request,session,redirect,url_for
from database import database

app = Flask(__name__)

def init_user_routes(app):
    @app.route('/users')
    def users():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
            SELECT users.id, users.username, users.role, users.store_id, stores.store_name
            FROM users
            LEFT JOIN stores ON users.store_id = stores.store_id
            ORDER BY users.id ASC
        ''')
            users = cursor.fetchall()

            roles = ['store admin']
         #   cursor.execute('SELECT store_id, store_name FROM stores')  # Get store info for dropdown
            cursor.execute('''
            SELECT store_id, store_name FROM stores
            WHERE store_id NOT IN (
                SELECT store_id FROM users WHERE role = 'store admin' AND store_id IS NOT NULL
            )
        ''')
            stores = cursor.fetchall()
            username = session.get('username')

            return render_template('users.html', users=users, roles= roles, stores=stores, username=username)
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
                INSERT INTO users (id, username, password, role, store_id) 
                VALUES (%s, %s, %s, %s, %s)
            ''', (
                data['id'],
                data['username'],
                data['password'],  # Consider hashing the password in production
                data['role'],
                data['store_id'] if 'store_id' in data else None
            ))
           # print(data)
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

            role = data['role']
            username = data['username']
            password = data['password']
            store_id = data.get('store_id') 

            # ✅ Update the user
            cursor.execute(
                '''
                UPDATE users
                SET username = %s,
                    password = %s,
                    role = %s,
                    store_id = %s
                WHERE id = %s
                ''',
                (username, password, role, store_id, id),
            )

            print(username,password,role,store_id,id)

            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'User not found'}), 404

            conn.commit()
            return jsonify({'success': True}), 200

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
    

    @app.route('/user_management')
    def users_management():
        if session.get('role') != 'store admin':
            return redirect(url_for('users'))

        store_id = session.get('store_id')  # Get the current store admin's store_id
        if not store_id:
            return "Store admin not assigned to a store", 403

        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('''
                SELECT users.id, users.username, users.role, users.store_id, stores.store_name
                FROM users
                LEFT JOIN stores ON users.store_id = stores.store_id
                WHERE users.store_id = %s
                ORDER BY users.id ASC
            ''', (store_id,))
            users = cursor.fetchall()

            username = session.get('username')

            return render_template('user_management.html', users=users,username=username)
        finally:
            cursor.close()
            conn.close()


    @app.route('/user_management/<int:id>', methods=['PUT'])
    def update_user_management(id):
        if session.get('role') != 'store admin':
            return redirect(url_for('users'))

        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)

          #  store_id = data['store_id'] if data['role'] == 'store_admin' else None
  
            cursor.execute(
                '''
                UPDATE users 
                SET username = %s, 
                    password = %s
                WHERE id = %s
                ''',
                (
                    data['username'],
                    data['password'],
                    id
                )
            )

            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'User not found'}),

            conn.commit()
            return jsonify({'success': True})

        except Exception as e:
            print(f"Error updating user: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()