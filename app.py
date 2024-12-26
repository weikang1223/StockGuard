from flask import Flask, render_template, redirect, url_for
from routes.dashboard import init_dashboard_routes
from routes.categories import init_category_routes
from database import database

app = Flask(__name__, static_folder='static')

# Check database connection before starting the app
try:
    conn = database.get_connection()
    if not conn:
        raise Exception("Could not establish database connection")
    conn.close()
except Exception as e:
    @app.route('/')
    @app.route('/<path:path>')
    def error_page(path=None):
        return render_template('error.html')
else:
    # Only initialize routes if database connection is successful
    init_dashboard_routes(app)
    init_category_routes(app)
    

    @app.route('/')
    def index():
        return redirect(url_for('dashboard'))

if __name__ == '__main__':
    app.run(debug=True)