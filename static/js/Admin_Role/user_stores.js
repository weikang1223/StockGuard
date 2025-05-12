document.addEventListener('DOMContentLoaded', function() {
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
                        const quantity = product.quantity;
                        let quantityClass = '';
                        
                        // Determine quantity class based on stock level
                        if (quantity === 0 || quantity === null || quantity === undefined) {
                            quantityClass = 'text-danger font-weight-bold'; // red (out of stock)
                        } else if (quantity < 10) {
                            quantityClass = 'text-danger font-weight-bold'; // red (very low)
                        } else if (quantity >= 10 && quantity < 40) {
                            quantityClass = 'text-warning font-weight-bold'; // yellow (low)
                        } else if (quantity >= 40 && quantity < 70) {
                            quantityClass = 'text-info font-weight-bold'; // blue (medium)
                        } else if (quantity >= 70 && quantity < 100) {
                            quantityClass = 'text-primary font-weight-bold'; // primary (high)
                        } else {
                            quantityClass = 'text-success font-weight-bold'; // green (very high)
                        }
                        
                        
                        inventoryTableBody.innerHTML += `
                            <tr>
                                <td>${product.product_name}</td>
                                <td class="${quantityClass}">${product.quantity}</td> <!-- Apply quantityClass here -->
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
   
    if (editStoreForm) {
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
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Store updated successfully!');
                    window.location.reload(); // Refresh the page to show updated store info
                } else {
                    alert('Error: ' + (result.message || 'Failed to update store'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error updating store');
            }
        });
    }
    
}); 