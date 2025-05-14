from dotenv import load_dotenv
import os
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash

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


# this is part generate the manager default password 
# currenlty is database have been stored the default hashed password for entering manager role username and password 
# if need part to run will cause the every refresh will be auto generate manager role but sucessfully control and show the manager already exists after refresh.


#plain_password = "122397"  # Plain password that you want to store
#hashed_password = generate_password_hash(plain_password)


# Step 4: Insert the user into the users table with hashed password
#try:
#    conn = get_connection()  # Get the database connection from your custom database module
#    cursor = conn.cursor()

#    cursor.execute("SELECT * FROM users WHERE username = %s", ('manager',))
#    existing_user = cursor.fetchone()

#    if existing_user:
#        print('Manager already exists. No need for insertion.')
        # print('')
#    else:
#        user_data = (1, 'manager', hashed_password, 'manager', None)

        # Execute the SQL query to insert the data
#        cursor.execute(
#            """
#            INSERT INTO users (id, username, password, role, store_id)
#            VALUES (%s, %s, %s, %s, %s)
#            """,
#            user_data
#        )

        # Commit the transaction
#        conn.commit()
#        print("Manager inserted successfully.")

#except Exception as e:
#    print("Error inserting user:", str(e))

#finally:
    # Close the cursor and connection
#    cursor.close()
#    conn.close()