from flask import render_template, request, redirect, url_for, session, jsonify
from database import database

def init_login_routes(app):
    @app.route('/login', methods=['GET'])
    def login_page():
        return render_template('login.html')

    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json() or request.form
        username = data.get("username")
        password = data.get("password")

        conn = database.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session["role"] = user["role"]
            return jsonify({"success": True})
        else:
            return jsonify({"success": False, "message": "Invalid username or password"}), 401

    @app.route('/logout')
    def logout():
        session.clear()
        return redirect(url_for('login_page'))