# test_connection.py
# testing the database connection from mysql
import mysql.connector
from mysql.connector import Error


def test_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="Wk123456",  # Replace with your password
            database="StockGuard"
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