from flask import render_template, request, redirect, url_for, session, jsonify
from database import database
from werkzeug.security import check_password_hash

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
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session["role"] = user["role"]
            session["store_id"] = user["store_id"]  # Add this if you're using store-specific dashboards
            print(f"User {username} logged in with store_id: {session['store_id']}")

            print(check_password_hash(user["password"], password))
            # Return role-specific redirect URL
            if user["role"] == "manager":
                redirect_url = url_for('dashboard')
            elif user["role"] == "store admin":
                redirect_url = url_for('user_dashboard')
            else:
                redirect_url = url_for('login_page')  # Fallback

            return jsonify({"success": True, "redirect_url": redirect_url})
        else:
            return jsonify({"success": False, "message": "Invalid username or password"}), 401


    @app.route('/logout')
    def logout():
        session.clear()
        return redirect(url_for('login_page'))
