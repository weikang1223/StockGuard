document.addEventListener('DOMContentLoaded', function () {
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    const editUserForm = document.getElementById('editUserForm');

    // Handle edit button click
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
            const userId = button.getAttribute('data-id');
            const username = button.getAttribute('data-username');

            // Populate the modal form
            document.getElementById('editUserId').value = userId;
            document.getElementById('editUsername').value = username;
            document.getElementById('editPassword').value = ''; // Clear password field for safety

            editUserModal.show();
        });
    });

    // Handle form submission
    editUserForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const userId = document.getElementById('editUserId').value;
        const username = document.getElementById('editUsername').value;
        const password = document.getElementById('editPassword').value;

        const payload = {
            username: username,
            password: password
        };

        try {
            const response = await fetch(`/user_management/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                alert('User updated successfully.');
                window.location.reload(); // Refresh the page to reflect changes
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Request failed', error);
            alert('An error occurred while updating the user.');
        }
    });
});
