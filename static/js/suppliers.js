document.addEventListener('DOMContentLoaded', function() {
    // Add Supplier functionality
    const addSupplierForm = document.getElementById('addSupplierForm');
    const addSupplierModal = new bootstrap.Modal(document.getElementById('addSupplierModal'));

    addSupplierForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const formData = new FormData(addSupplierForm);
        try {
            const response = await fetch('/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_name: formData.get('company_name'),
                    contact_person: formData.get('contact_person'),
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                    address: formData.get('address')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Supplier added successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to add supplier'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding supplier');
        }
    });

    // Edit Supplier functionality
    const editButtons = document.querySelectorAll('.edit-btn');
    const editSupplierModal = new bootstrap.Modal(document.getElementById('editSupplierModal'));
    const editSupplierForm = document.getElementById('editSupplierForm');

    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('editSupplierId').value = button.dataset.id;
            document.getElementById('editCompanyName').value = button.dataset.name;
            document.getElementById('editContactPerson').value = button.dataset.contact;
            document.getElementById('editPhone').value = button.dataset.phone;
            document.getElementById('editEmail').value = button.dataset.email;
            document.getElementById('editAddress').value = button.dataset.address;
            editSupplierModal.show();
        });
    });

    editSupplierForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editSupplierForm);
        const id = formData.get('supplier_id');
        
        try {
            const response = await fetch(`/suppliers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_name: formData.get('company_name'),
                    contact_person: formData.get('contact_person'),
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                    address: formData.get('address')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Supplier updated successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to update supplier'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating supplier');
        }
    });

    // Delete Supplier functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const deleteSupplierModal = new bootstrap.Modal(document.getElementById('deleteSupplierModal'));
    let supplierToDelete = null;

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            supplierToDelete = button.dataset.id;
            deleteSupplierModal.show();
        });
    });

    document.getElementById('confirmDeleteSupplier').addEventListener('click', async () => {
        if (supplierToDelete) {
            try {
                const response = await fetch(`/suppliers/${supplierToDelete}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Supplier deleted successfully!');
                    window.location.reload();
                } else {
                    alert('Error: ' + (result.message || 'Failed to delete supplier'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting supplier');
            }
        }
    });
}); 