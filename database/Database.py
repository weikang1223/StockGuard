from dotenv import load_dotenv
import os
import mysql.connector
from mysql.connector import Error

# Load environment variables
env_path = "C:/Users/leewe/Project/database/.env"
load_dotenv(env_path)

def get_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DATABASE_HOST'),
            user=os.getenv('DATABASE_USERNAME'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE')
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise e


# testing connection from mysql 