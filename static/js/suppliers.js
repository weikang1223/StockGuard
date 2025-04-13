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
}); 