from flask import Flask, render_template, session, redirect, url_for, jsonify, request, send_file
import pandas as pd
from io import BytesIO
from fpdf import FPDF
from database import database

def init_report_routes(app):
    # Manager report route
   @app.route('/report')
   def report():
       conn = database.get_connection()
       cursor = conn.cursor(dictionary=True)

       # Fetching product list
       cursor.execute('''
           SELECT 
               p.product_id,
               p.product_name,
               p.quantity,
               p.price,
               s.store_name,
               p.store_id,
               c.categories_name,
               p.category_id
           FROM products p
           JOIN stores s ON p.store_id = s.store_id
           LEFT JOIN categories c ON p.category_id = c.id
       ''')
       products = cursor.fetchall()

       # Fetching product transaction list
       cursor.execute('''
           SELECT 
               pt.transaction_id,
               pt.product_id,
               p.product_name,
               pt.quantity,
               pt.transaction_date,
               pt.transaction_type,
               u.username AS username
           FROM product_transactions pt
           JOIN products p ON pt.product_id = p.product_id
           JOIN users u ON pt.created_by = u.id
           ORDER BY pt.transaction_date DESC
       ''')
       transactions = cursor.fetchall()

       # Apply filters (search and store_id)
       search = request.args.get('search', '').lower()
       store_id = request.args.get('store_id', '')

       # Filtering products based on search and store_id
       filtered_products = []
       for product in products:
           matches_search = (
               not search or
               search in product['product_name'].lower() or
               search in product['store_name'].lower()  # Adjust this line to filter by store name or other criteria
           )
           matches_store = not store_id or str(product['store_id']) == store_id

           if matches_search and matches_store:
               filtered_products.append(product)

       # Assign filtered products to the final product list
       products = filtered_products

       # Fetch stores for filtering dropdown
       cursor.execute('SELECT store_id, store_name FROM stores')
       stores = cursor.fetchall()

       username = session.get('username')
       
       # filter for categories
       cursor.execute('SELECT id, categories_name FROM categories')
       categories = cursor.fetchall()

       cursor.close()
       conn.close()

       # Rendering the report page with filtered products and transactions
       return render_template('report.html', products=products, transactions=transactions, stores=stores, username=username,categories=categories)
   

   @app.route('/user_report')
   def user_report():
       conn = database.get_connection()
       cursor = conn.cursor(dictionary=True)

       store_id =session.get('store_id')

       # Fetching product list
       cursor.execute('''
                SELECT p.product_id, p.product_name, p.quantity, p.price, 
                       c.categories_name AS category_name, c.id AS category_id,
                       s.company_name AS supplier_name, s.id AS supplier_id,
                       st.store_name, st.store_id
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN stores st ON p.store_id = st.store_id
                WHERE p.store_id = %s
            ''', (store_id,))
       products = cursor.fetchall()
       username = session.get('username')

       cursor.close()
       conn.close()

       return render_template('user_report.html', products=products, username=username)

