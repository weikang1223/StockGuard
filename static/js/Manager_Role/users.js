document.addEventListener('DOMContentLoaded', function () {
    // Add User
    document.getElementById('addUserForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            id: document.getElementById('id').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value, // Consider hashing in production
            role: document.getElementById('role').value,
            store_id: document.getElementById('store_id').value, // Store ID for store_admin role
        };

        fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert('User added successfully');
                    location.reload();
                } else {
                    alert('Error adding user: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error adding user');
            });
    });

    // Edit User
    const editButtons = document.querySelectorAll('.edit-btn');
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    const editUserForm = document.getElementById('editUserForm');

    editButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-id');
            const username = button.getAttribute('data-username');
            const role = button.getAttribute('data-role');
            const storeId = button.getAttribute('data-store-id');

            // Populate the form fields with the current data
            document.getElementById('editUserId').value = userId;
            document.getElementById('editUsername').value = username;
            document.getElementById('editRole').value = role;
            document.getElementById('editStoreId').value = storeId;

            // Handle role and store ID visibility
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
            editUserModal.show();
        });
    });

    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userId = document.getElementById('editUserId').value;
        const formData = {
            username: document.getElementById('editUsername').value,
            password: document.getElementById('editPassword').value,
            role: document.getElementById('editRole').value,
            store_id: document.getElementById('editStoreId').value,
        };

        try {
            const response = await fetch(`/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                alert('User updated successfully');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to update user'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating user');
        }
    });

    // Delete User
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const deleteUserModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
    let userToDelete = null;

    deleteButtons.forEach((button) => {
        button.addEventListener('click', function () {
            userToDelete = this.getAttribute('data-id');
            // Show the delete confirmation modal
            deleteUserModal.show();
        });
    });

    document.getElementById('confirmDeleteUser').addEventListener('click', async function () {
        if (userToDelete) {
            try {
                const response = await fetch(`/users/${userToDelete}`, {
                    method: 'DELETE',
                });

                const result = await response.json();

                if (response.ok) {
                    alert('User deleted successfully');
                    window.location.reload();
                } else {
                    alert('Error deleting user: ' + (result.message || 'Failed to delete user'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting user');
            }
        }
    });
});