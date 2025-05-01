from flask import render_template, jsonify, request,session,redirect, url_for
from database import database

def init_supplier_routes(app):
    @app.route('/suppliers')
    def suppliers():
        if session.get('role') != 'manager':
            return redirect(url_for('user_suppliers'))
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT id, company_name, contact_name, phone, email, address FROM suppliers')
            suppliers = cursor.fetchall()
            username = session.get('username')
            user_role = session.get('role')  # <-- Make sure you get user role from session
            print(user_role)
            return render_template('suppliers.html', suppliers=suppliers, username=username, user_role=user_role)
        finally:
            cursor.close()
            conn.close()

    @app.route('/suppliers', methods=['POST'])
    def add_supplier():
        if session.get('role') != 'manager':
            return redirect(url_for('user_suppliers'))
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                INSERT INTO suppliers (company_name, contact_name, phone, email, address) 
                VALUES (%s, %s, %s, %s, %s)
            ''', (
                data['company_name'],
                data['contact_person'],
                data['phone'],
                data['email'],
                data['address']
            ))
            
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error adding supplier: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/suppliers/<int:id>', methods=['PUT'])
    def update_supplier(id):
        if session.get('role') != 'manager':
            return redirect(url_for('user_suppliers'))
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                UPDATE suppliers 
                SET company_name = %s,
                    contact_name = %s,
                    phone = %s,
                    email = %s,
                    address = %s
                WHERE id = %s
            ''', (
                data['company_name'],
                data['contact_person'],
                data['phone'],
                data['email'],
                data['address'],
                id
            ))
            
            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'Supplier not found'}), 404
                
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error updating supplier: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()

    @app.route('/suppliers/<int:id>', methods=['DELETE'])
    def delete_supplier(id):
        if session.get('role') != 'manager':
            return redirect(url_for('user_suppliers'))
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('DELETE FROM suppliers WHERE id = %s', (id,))
            
            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': 'Supplier not found'}), 404
                
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error deleting supplier: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close() 



    @app.route('/user_suppliers')
    def user_suppliers():
        if session.get('role') != 'store admin':
            return redirect(url_for('suppliers'))
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT id, company_name, contact_name, phone, email, address FROM suppliers')
            suppliers = cursor.fetchall()
            username = session.get('username')
            return render_template('user_suppliers.html', suppliers=suppliers, username=username)
        finally:
            cursor.close()
            conn.close()

    @app.route('/user_suppliers', methods=['POST'])
    def add_user_supplier():
        if session.get('role') != 'store admin':
            return redirect(url_for('suppliers'))
        try:
            data = request.get_json()
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute('''
                INSERT INTO suppliers (company_name, contact_name, phone, email, address) 
                VALUES (%s, %s, %s, %s, %s)
            ''', (
                data['company_name'],
                data['contact_person'],
                data['phone'],
                data['email'],
                data['address']
            ))
            
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            print(f"Error adding supplier: {str(e)}")
            return jsonify({'success': False, 'message': str(e)}), 500
        finally:
            cursor.close()
            conn.close()