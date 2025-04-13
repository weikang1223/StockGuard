from flask import render_template, jsonify, request
from database import database

def init_supplier_routes(app):
    @app.route('/suppliers')
    def suppliers():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT id, company_name, contact_name, phone, email, address FROM suppliers')
            suppliers = cursor.fetchall()
            return render_template('suppliers.html', suppliers=suppliers)
        finally:
            cursor.close()
            conn.close()

    @app.route('/suppliers', methods=['POST'])
    def add_supplier():
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