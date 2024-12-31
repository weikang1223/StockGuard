document.addEventListener('DOMContentLoaded', function() {
    const lowStockToast = new bootstrap.Toast(document.getElementById('lowStockToast'));
    
    // Fetch low stock items when page loads
    async function checkLowStockItems() {
        try {
            const response = await fetch('/dashboard/low-stock');
            const data = await response.json();
            
            if (data.length > 0) {
                let message = '<div class="mb-2"><strong>Low Stock Items:</strong></div>';
                data.forEach(item => {
                    message += `
                        <div class="mb-2">
                            <strong>${item.product_name}</strong> (${item.quantity} remaining)<br>
                            Supplier: ${item.supplier_name}<br>
                            Contact: ${item.supplier_contact_person}<br>
                            Phone: ${item.supplier_phone}<br>
                            Email: ${item.supplier_email}
                        </div>
                    `;
                });
                
                document.getElementById('lowStockToastBody').innerHTML = message;
                lowStockToast.show();
            }
        } catch (error) {
            console.error('Error checking low stock:', error);
        }
    }

    checkLowStockItems();
});