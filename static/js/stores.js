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

    // View inventory buttons
    const viewInventoryButtons = document.querySelectorAll('.view-inventory-btn');

    viewInventoryButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            const storeId = button.dataset.id; 
            try {
                const response = await fetch(`/stores/${storeId}/products`);
                const products = await response.json();

                const inventoryTableBody = document.getElementById('inventoryTableBody');
                inventoryTableBody.innerHTML = ''; // Clear previous products

                if (Array.isArray(products) && products.length > 0) {
                    products.forEach((product) => {
                        inventoryTableBody.innerHTML += `
                            <tr>
                                <td>${product.product_name}</td>
                                <td>${product.quantity}</td>
                                <td>${product.categories_name || 'N/A'}</td>
                                <td>$${product.price ? product.price.toFixed(2) : 'N/A'}</td>
                            </tr>
                        `;
                    });
                } else {
                    inventoryTableBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center">No products in this store</td>
                        </tr>
                    `;
                }

                // Show the inventory modal
                const viewInventoryModal = new bootstrap.Modal(document.getElementById('viewInventoryModal'));
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