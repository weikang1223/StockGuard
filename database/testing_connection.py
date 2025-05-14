# test_connection.py
# initial testing on the connection 
# no in use
#from database import database
#import sys

# to testing the connection is working from mysql workbench 
#def test_database_connection():
#    print("\nTesting Database Connection...")
#    print("=" * 50)

#    try:
        # Get connection
#        connection_info = database.get_connection()

#        if connection_info['status'] == 'connected':
#            print("✅ Connection Successful!")
#            print(f"Host: {connection_info['host']}")
#            print(f"Database: {connection_info['database']}")
#            print(f"User: {connection_info['user']}")

            # Close the connection
#            if connection_info['connection'].is_connected():
#                connection_info['connection'].close()
#                print("MySQL connection is closed")
#        else:
#            print("❌ Connection Failed!")
#            print(f"Error: {connection_info['message']}")

#    except Exception as e:
#        print(f"❌ Connection Error: {e}")

#    print("=" * 50)


# if __name__ == "__main__":
#    test_database_connection()