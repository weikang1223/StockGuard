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
                    supplier_id: formData.get('supplier_id'),
                    store_id: formData.get('store_id'),
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

    // Stock Out functionality
    const stockOutForm = document.getElementById('stockOutForm');
    const stockOutModal = new bootstrap.Modal(document.getElementById('stockOutModal'));
    const stockOutStore = document.getElementById('stockOutStore');
    const stockOutProduct = document.getElementById('stockOutProduct');
    const stockOutQuantity = document.getElementById('stockOutQuantity');
    const stockOutDate = document.getElementById('stockOutDate');

    // Set default date to today
    stockOutDate.valueAsDate = new Date();

    // Store all products data
    const productsData = Array.from(document.querySelectorAll('#productsTable tbody tr')).map(row => ({
        id: row.querySelector('td:first-child').textContent.trim(),
        name: row.querySelector('td:nth-child(2)').textContent.trim(),
        storeId: row.dataset.storeId,
        quantity: parseInt(row.querySelector('td:nth-child(6)').textContent.trim())
    }));

    // Handle store selection
    stockOutStore.addEventListener('change', function() {
        const selectedStoreId = this.value;
        const productSelect = document.getElementById('stockOutProduct');
        const quantityInput = document.getElementById('stockOutQuantity');
        
        // Clear and disable product select if no store is selected
        if (!selectedStoreId) {
            productSelect.innerHTML = '<option value="">Select Product</option>';
            productSelect.disabled = true;
            quantityInput.disabled = true;
            quantityInput.value = '';
            return;
        }

        // Filter products for selected store
        const storeProducts = productsData.filter(product => product.storeId === selectedStoreId);
        
        // Update product select options
        productSelect.innerHTML = '<option value="">Select Product</option>';
        storeProducts.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (Current Stock: ${product.quantity})`;
            option.dataset.quantity = product.quantity;
            productSelect.appendChild(option);
        });

        // Enable product select if there are products for this store
        productSelect.disabled = storeProducts.length === 0;
        if (storeProducts.length === 0) {
            alert('No products available in this store');
        }
    });

    // Update max quantity when product is selected
    stockOutProduct.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const quantityInput = document.getElementById('stockOutQuantity');
        
        if (this.value) {
            const maxQuantity = parseInt(selectedOption.dataset.quantity);
            quantityInput.max = maxQuantity;
            quantityInput.value = '';
            quantityInput.disabled = false;
        } else {
            quantityInput.disabled = true;
            quantityInput.value = '';
        }
    });

    stockOutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(stockOutForm);
        
        if (!formData.get('store_id') || !formData.get('product_id') || !formData.get('quantity')) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('/products/stock-out', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: formData.get('product_id'),
                    store_id: formData.get('store_id'),
                    quantity: formData.get('quantity'),
                    date: formData.get('date')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Stock out recorded successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to record stock out'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error recording stock out');
        }
    });
}); 