from flask import render_template
from database import database

def init_category_routes(app):
    @app.route('/categories')
    def categories():
        try:
            conn = database.get_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT id, categories_name FROM categories')
            categories = cursor.fetchall()
            return render_template('categories.html', categories=categories)
        finally:
            cursor.close()
            conn.close() 