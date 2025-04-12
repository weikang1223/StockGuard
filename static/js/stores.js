document.addEventListener('DOMContentLoaded', function() {
    const LOW_STOCK_THRESHOLD = 10;
    const lowStockToast = new bootstrap.Toast(document.getElementById('lowStockToast'));
    
    // Add Store functionality
    const addStoreForm = document.getElementById('addStoreForm');
    const addStoreModal = new bootstrap.Modal(document.getElementById('addStoreModal'));

    addStoreForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addStoreForm);
        
        try {
            const response = await fetch('/stores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    store_name: formData.get('store_name'),
                    location: formData.get('location')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Store added successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to add store'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding store');
        }
    });

    // Transfer Products functionality
    const fromStoreSelect = document.getElementById('fromStore');
    const toStoreSelect = document.getElementById('toStore');
    const productSelect = document.getElementById('product');
    const quantityInput = document.getElementById('quantity');
    const transferForm = document.getElementById('transferForm');

    // Update product list when source store is selected
    fromStoreSelect.addEventListener('change', async () => {
        const storeId = fromStoreSelect.value;
        if (storeId) {
            try {
                const response = await fetch(`/stores/${storeId}/products`);
                const products = await response.json();
                
                // Clear and update product dropdown
                productSelect.innerHTML = '<option value="">Select Product</option>';
                products.forEach(product => {
                    productSelect.innerHTML += `
                        <option value="${product.product_id}" 
                                data-quantity="${product.quantity}">
                            ${product.product_name} (${product.quantity} available)
                        </option>
                    `;
                });

                // Show available products table
                const availableProducts = document.getElementById('availableProducts');
                availableProducts.innerHTML = '';
                let lowStockMessage = '';

                products.forEach(product => {
                    const isLowStock = product.quantity < LOW_STOCK_THRESHOLD;
                    const rowClass = isLowStock ? 'table-warning' : '';
                    
                    if (isLowStock) {
                        lowStockMessage += `
                            <div class="mb-2">
                                <strong>${product.product_name}</strong> (${product.quantity} remaining)<br>
                                Supplier: ${product.supplier_name}<br>
                                Contact: ${product.supplier_contact_person}<br>
                                Phone: ${product.supplier_phone}<br>
                                Email: ${product.supplier_email}
                            </div>
                        `;
                    }
                    
                    availableProducts.innerHTML += `
                        <tr class="${rowClass}">
                            <td>
                                ${product.product_name}
                                ${isLowStock ? '<i class="bi bi-exclamation-triangle-fill text-warning ms-2"></i>' : ''}
                            </td>
                            <td>${product.quantity}</td>
                            <td>${product.category_name || 'N/A'}</td>
                            <td>$${product.price ? product.price.toFixed(2) : 'N/A'}</td>
                        </tr>
                    `;
                });

                if (products.length === 0) {
                    availableProducts.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center">No products available in this store</td>
                        </tr>
                    `;
                }

                // Show toast if there are low stock items
                if (lowStockMessage) {
                    document.getElementById('lowStockToastBody').innerHTML = lowStockMessage;
                    lowStockToast.show();
                }

            } catch (error) {
                console.error('Error fetching products:', error);
            }
        }
    });

    // Validate quantity when product is selected
    productSelect.addEventListener('change', () => {
        const selectedOption = productSelect.selectedOptions[0];
        if (selectedOption) {
            const maxQuantity = selectedOption.dataset.quantity;
            quantityInput.max = maxQuantity;
            quantityInput.placeholder = `Max: ${maxQuantity}`;
        }
    });

    // Handle transfer submission
    transferForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(transferForm);
        
        try {
            const response = await fetch('/stores/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from_store: formData.get('from_store'),
                    to_store: formData.get('to_store'),
                    product_id: formData.get('product_id'),
                    quantity: formData.get('quantity')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Products transferred successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to transfer products'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error transferring products');
        }
    });
    // Edit funcationlity 
    const editButtons = document.querySelectorAll('.edit-btn');
    const editStoreModal = new bootstrap.Modal(document.getElementById('editStoreModal'));
    const editStoreForm = document.getElementById('editStoreForm');

    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('editStoreId').value = button.dataset.id;
            document.getElementById('editStoreName').value = button.dataset.name;
            document.getElementById('editStoreLocation').value = button.dataset.location;
            
            editStoreModal.show();
        });
    });

    editStoreForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editStoreForm);
        const id = formData.get('store_id');
        
        try {
            const response = await fetch(`/stores/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    store_name: formData.get('store_name'),
                    location: formData.get('location'),         
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Store updated successfully!'); 
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to update store')); // Updated alert message
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating store'); 
        }
    });    

    // Delete functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    let storeToDelete = null;

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            storeToDelete = button.dataset.id;
            deleteModal.show();
        });
    });

    document.getElementById('confirmDelete').addEventListener('click', async () => {
        if (storeToDelete) {
            try {
                const response = await fetch(`/stores/${storeToDelete}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Store deleted successfully!');
                    window.location.reload();
                } else {
                    alert('Error: ' + (result.message || 'Failed to delete store'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting store');
            }
        }
    });

    // View Inventory functionality
    const viewInventoryButtons = document.querySelectorAll('.view-inventory-btn');
    const viewInventoryModal = new bootstrap.Modal(document.getElementById('viewInventoryModal'));
    const inventoryTableBody = document.getElementById('inventoryTableBody');

    viewInventoryButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const storeId = button.dataset.id;
            try {
                const response = await fetch(`/stores/${storeId}/products`);
                const products = await response.json();
                
                // Clear and update inventory table
                inventoryTableBody.innerHTML = '';
                products.forEach(product => {
                    inventoryTableBody.innerHTML += `
                        <tr>
                            <td>${product.product_name}</td>
                            <td>${product.quantity}</td>
                            <td>${product.category_name || 'N/A'}</td>
                            <td>$${product.price ? product.price.toFixed(2) : 'N/A'}</td>
                        </tr>
                    `;
                });
                
                if (products.length === 0) {
                    inventoryTableBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center">No products in this store</td>
                        </tr>
                    `;
                }
                
                viewInventoryModal.show();
            } catch (error) {
                console.error('Error fetching store inventory:', error);
                alert('Error loading store inventory');
            }
        });
    });

    // Search and filter functionality
    const searchInput = document.getElementById('searchInput');
    const locationFilter = document.getElementById('locationFilter');
    
    // Add event listeners for search and filter
    if (searchInput) {
        searchInput.addEventListener('keyup', filterStores);
    }
    
    if (locationFilter) {
        locationFilter.addEventListener('change', filterStores);
    }

    // Combined search and filter function
    function filterStores() {
        const searchValue = searchInput.value.toLowerCase();
        const locationValue = locationFilter.value;
        
        const rows = document.querySelectorAll('#storesTable tbody tr');
        
        rows.forEach(row => {
            const storeName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            // Get location from the third cell (index 2) which contains the location
            const location = row.querySelector('td:nth-child(3)').textContent;
            
            const matchesSearch = storeName.includes(searchValue);
            const matchesLocation = !locationValue || location === locationValue;
            
            if (matchesSearch && matchesLocation) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}); 