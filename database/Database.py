# database.py
from dotenv import load_dotenv
import os
import mysql.connector
from mysql.connector import Error

env_path  ="C:/Users/leewe/PycharmProjects/StockGuard/database/.env"
# Load environment variables
load_dotenv(env_path)


def get_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            user=os.getenv('DATABASE_USERNAME'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE')
        )

        if connection.is_connected():
            return {
                'status': 'connected',
                'connection': connection,
                'host': os.getenv('DATABASE_HOST'),
                'database': os.getenv('DATABASE'),
                'user': os.getenv('DATABASE_USERNAME')
            }
    except Error as e:
        return {
            'status': 'error',
            'message': str(e)
        }