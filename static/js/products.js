document.addEventListener('DOMContentLoaded', function() {
    // Add functionality
    const addForm = document.getElementById('addForm');
    const addModal = new bootstrap.Modal(document.getElementById('addModal'));

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addForm);
        
        try {
            const response = await fetch('/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_name: formData.get('product_name'),
                    category_id: formData.get('category_id'),
                    quantity: formData.get('quantity'),
                    price: formData.get('price')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Product added successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to add product'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding product');
        }
    });

    // Edit functionality
    const editButtons = document.querySelectorAll('.edit-btn');
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const editForm = document.getElementById('editForm');

    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('editId').value = button.dataset.id;
            document.getElementById('editName').value = button.dataset.name;
            document.getElementById('editCategory').value = button.dataset.category;
            document.getElementById('editQuantity').value = button.dataset.quantity;
            document.getElementById('editPrice').value = button.dataset.price;
            editModal.show();
        });
    });

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        const id = formData.get('product_id');
        
        try {
            const response = await fetch(`/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_name: formData.get('product_name'),
                    category_id: formData.get('category_id'),
                    quantity: formData.get('quantity'),
                    price: formData.get('price')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Product updated successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to update product'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating product');
        }
    });

    // Delete functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    let productToDelete = null;

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            productToDelete = button.dataset.id;
            deleteModal.show();
        });
    });

    document.getElementById('confirmDelete').addEventListener('click', async () => {
        if (productToDelete) {
            try {
                const response = await fetch(`/products/${productToDelete}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Product deleted successfully!');
                    window.location.reload();
                } else {
                    alert('Error: ' + (result.message || 'Failed to delete product'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting product');
            }
        }
    });
}); 