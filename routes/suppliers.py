from flask import render_template
from database import database

def init_supplier_routes(app):
    @app.route('/suppliers')
    def suppliers():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT id, company_name, supplier_contact_person, phone, email, address FROM suppliers')
            suppliers = cursor.fetchall()
            return render_template('suppliers.html', suppliers=suppliers)
        finally:
            cursor.close()
            conn.close() 