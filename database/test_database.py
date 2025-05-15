# test_connection.py
# testing the database connection from mysql
# for testing purpose

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# example on this C:\Users\leewe\Desktop\StockGuard-1\database\.env
env_path = "C:/Users/leewe/Project/database/.env"  # copy .env file path and paste here 
load_dotenv(env_path)

def test_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            user=os.getenv('DATABASE_USERNAME'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE')
        )

        if connection.is_connected():
            db_info = connection.get_server_info()
            cursor = connection.cursor()
            cursor.execute("select database();")
            database_name = cursor.fetchone()[0]
            print("=" * 50)
            print("✅ Successfully connected to MySQL Database!")
            print(f"MySQL Server version: {db_info}")
            print(f"Database name: {database_name}")
            print("=" * 50)

    except Error as e:
        print("=" * 50)
        print("❌ Error connecting to MySQL Database")


    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()
            print("MySQL connection is closed")

if __name__ == "__main__":
    test_connection()