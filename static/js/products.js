document.addEventListener('DOMContentLoaded', function() {
    // Add functionality
    const addForm = document.getElementById('addForm');
    const addModal = new bootstrap.Modal(document.getElementById('addModal'));

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addForm);
        
        // Debug: Log form data
        console.log('Form data:', {
            product_name: formData.get('product_name'),
            category_id: formData.get('category_id'),
            supplier_id: formData.get('supplier_id'),
            store_id: formData.get('store_id'),
            quantity: formData.get('quantity'),
            price: formData.get('price')
        });
        
        try {
            const response = await fetch('/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_name: formData.get('product_name'),
                    category_id: formData.get('category_id'),
                    supplier_id: formData.get('supplier_id'),
                    store_id: formData.get('store_id'),
                    quantity: formData.get('quantity'),
                    price: formData.get('price')
                })
            });
            
            // Debug: Log response
            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Response data:', result);
            
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
            document.getElementById('editSupplier').value = button.dataset.supplier;
            document.getElementById('editStore').value = button.dataset.store || '';
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
                    supplier_id: formData.get('supplier_id'),
                    store_id: formData.get('store_id'),
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

    // Search functionality
    document.getElementById('searchInput').addEventListener('keyup', function() {
        filterProducts();
    });

    // Store filter functionality
    document.getElementById('storeFilter').addEventListener('change', function() {
        filterProducts();
    });

    // Combined search and filter function
    function filterProducts() {
        const searchValue = document.getElementById('searchInput').value.toLowerCase();
        const storeValue = document.getElementById('storeFilter').value;
        const rows = document.querySelectorAll('#productsTable tbody tr');
        
        rows.forEach(row => {
            const productName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const storeId = row.dataset.storeId;
            
            const matchesSearch = productName.includes(searchValue);
            const matchesStore = !storeValue || storeId === storeValue;
            
            if (matchesSearch && matchesStore) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}); 