document.addEventListener('DOMContentLoaded', function() {
    // Add Supplier
    document.getElementById('addSupplierForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            company_name: document.getElementById('companyName').value,
            contact_person: document.getElementById('contactPerson').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value
        };

        fetch('/suppliers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Supplier added successfully');
                location.reload();
            } else {
                alert('Error adding supplier: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding supplier');
        });
    });

    // Edit Supplier
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            const supplierId = this.getAttribute('data-id');
            const companyName = this.getAttribute('data-name');
            const contactPerson = this.getAttribute('data-contact');
            const phone = this.getAttribute('data-phone');
            const email = this.getAttribute('data-email');
            const address = this.getAttribute('data-address');
            
            document.getElementById('editSupplierId').value = supplierId;
            document.getElementById('editCompanyName').value = companyName;
            document.getElementById('editContactPerson').value = contactPerson;
            document.getElementById('editPhone').value = phone;
            document.getElementById('editEmail').value = email;
            document.getElementById('editAddress').value = address;
            
            new bootstrap.Modal(document.getElementById('editSupplierModal')).show();
        });
    });

    // Update Supplier
    document.getElementById('editSupplierForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const supplierId = document.getElementById('editSupplierId').value;
        const formData = {
            company_name: document.getElementById('editCompanyName').value,
            contact_person: document.getElementById('editContactPerson').value,
            phone: document.getElementById('editPhone').value,
            email: document.getElementById('editEmail').value,
            address: document.getElementById('editAddress').value
        };

        fetch(`/suppliers/${supplierId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Supplier updated successfully');
                location.reload();
            } else {
                alert('Error updating supplier: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating supplier');
        });
    });

    // Delete Supplier
    let supplierToDelete = null;
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            supplierToDelete = this.getAttribute('data-id');
            new bootstrap.Modal(document.getElementById('deleteSupplierModal')).show();
        });
    });
    
    document.getElementById('confirmDeleteSupplier').addEventListener('click', function() {
        if (supplierToDelete) {
            fetch(`/suppliers/${supplierToDelete}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Supplier deleted successfully');
                    location.reload();
                } else {
                    alert('Error deleting supplier: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting supplier');
            });
        }
    });

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#suppliersTable tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    const viewInventoryButtons = document.querySelectorAll('.view-inventory-btn');

    viewInventoryButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const supplierId = button.getAttribute('data-id');
            try {
                const response = await fetch(`/suppliers/${supplierId}`);
                const products = await response.json();
    
                const inventoryTableBody = document.getElementById('inventoryTableBody');
                inventoryTableBody.innerHTML = ''; // Clear previous data
    
                if (Array.isArray(products) && products.length > 0) {
                    products.forEach(product => {
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
                        quantityClass = 'text-success font-weight-bold' ; // green (very high)
                    }
                    
                        inventoryTableBody.innerHTML += `
                            <tr>
                                <td>${product.store_name}</td>
                                <td>${product.product_name}</td>
                                <td class="${quantityClass}">${quantity !== null && quantity !== undefined ? quantity : '0'}</td>
                                <td>$${parseFloat(product.price).toFixed(2)}</td>
                            </tr>
                        `;
                    });
                } else {
                    inventoryTableBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center">No products found for this supplier</td>
                        </tr>
                    `;
                }
    
                const inventoryModal = new bootstrap.Modal(document.getElementById('viewInventoryModal'));
                inventoryModal.show();
    
            } catch (error) {
                console.error('Error loading supplier inventory:', error);
                alert('Failed to load inventory. Please try again.');
            }
        });
    });
}); 