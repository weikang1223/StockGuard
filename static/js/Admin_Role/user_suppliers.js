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

        fetch('/user_suppliers', {
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
    document.getElementById('searchInput').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#suppliersTable tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}); 