document.addEventListener('DOMContentLoaded', function() {
    // Add User
    document.getElementById('addUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('id').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,  // Consider hashing in production
            role: document.getElementById('role').value,
            store_id: document.getElementById('store_id').value // Store ID for store_admin role

            
        };

        fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('User added successfully');
                location.reload();
            } else {
                alert('Error adding user: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding user');
        });
    });

    // Edit User
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const username = this.getAttribute('data-username');
            const role = this.getAttribute('data-role');
            const storeId = this.getAttribute('data-store-id');
            
            document.getElementById('editUserId').value = userId;
            document.getElementById('editUsername').value = username;
            document.getElementById('editRole').value = role;
            document.getElementById('editStoreId').value = storeId;

            const roleSelect = document.getElementById('editRole');
        const storeSelect = document.getElementById('editStoreId');

        if (role === 'manager') {
            roleSelect.setAttribute('disabled', true);
            storeSelect.setAttribute('disabled', true);
        } else {
            roleSelect.removeAttribute('disabled');
            storeSelect.removeAttribute('disabled');
        }
    
            // Show modal
            new bootstrap.Modal(document.getElementById('editUserModal')).show();
        });
    });
    
    document.getElementById('editUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('editUserId').value;
        const formData = {
            username: document.getElementById('editUsername').value,
            password: document.getElementById('editPassword').value,
            role: document.getElementById('editRole').value,  // Correct role value
            store_id: document.getElementById('editStoreId').value // Store ID for store_admin role
        };
    
        fetch(`/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('User updated successfully');
                location.reload();
            } else {
                alert('Error updating user: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating user');
        });
    });
    

    // Delete User
    let userToDelete = null;

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            userToDelete = this.getAttribute('data-id');
            new bootstrap.Modal(document.getElementById('deleteUserModal')).show();
        });
    });

    document.getElementById('confirmDeleteUser').addEventListener('click', function () {
        if (userToDelete) {
            fetch(`/users/${userToDelete}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                alert(data.success ? 'User deleted successfully' : 'Error deleting user: ' + data.message);
                if (data.success) location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting user');
            });
        }
    });
});

