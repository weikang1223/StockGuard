document.addEventListener('DOMContentLoaded', function () {
    const storeId = document.getElementById('storeId').value; // or from another element where you store the store_id
    // Handle product add form submission
    const addForm = document.getElementById('addForm');
    const addModal = new bootstrap.Modal(document.getElementById('addModal'));
    // Handle form submission
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const formData = new FormData(addForm);

        // Collect the form data and include the store_id from session
        const productData = {
            product_name: formData.get('product_name'),
            category_id: formData.get('category_id'),
            supplier_id: formData.get('supplier_id'),
            store_id: storeId, // Attach the store_id from session
            quantity: formData.get('quantity'),
            price: formData.get('price'),
        };

        try {
            // Send the data to the server using the POST method
            const response = await fetch('/user_products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const result = await response.json(); // Parse the response

            if (response.ok) {
                alert('Product added successfully!');
                window.location.reload(); // Refresh the page to show the new product
            } else {
                alert('Error: ' + (result.message || 'Failed to add product'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding product');
        }
    });

    // Handle stock-out form submission
    const stockOutForm = document.getElementById('stockOutForm');
    const stockOutModal = new bootstrap.Modal(document.getElementById('stockOutModal'));
    const stockOutDate = document.getElementById('stockOutDate');
    stockOutDate.valueAsDate =new Date();

    // Handle stock-out form submission
    stockOutForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const formData = new FormData(stockOutForm);

        // Collect the form data and include any necessary session variables (store_id if required)
        const stockOutData = {
            product_id: formData.get('product_id'), // Product ID
            quantity: formData.get('quantity'), // Quantity to stock out
            date: formData.get('date'), // Date of the stock out
        };

        try {
            // Send the data to the server using the POST method
            const response = await fetch('/user_products/stock-out', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(stockOutData),
            });

            const result = await response.json(); // Parse the response

            if (response.ok) {
                alert('Stock out recorded successfully!');
                stockOutModal.hide(); // Close the modal
                window.location.reload(); // Refresh the page to reflect changes
            } else {
                alert('Error: ' + (result.message || 'Failed to process stock-out'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error processing stock-out');
        }
    });

       // Search functionality
       document.getElementById('searchInput').addEventListener('keyup', function() {
        filterProducts();
    });
      // category filter functionality 
    document.getElementById('categoriesFilter').addEventListener('change', function() {
        filterProducts();
    });
     // supplier filter functionalitt
     document.getElementById('supplierFilter').addEventListener('change', function() {
        filterProducts();
    });



    // Combined search and filter function
    function filterProducts() {
        const searchValue = document.getElementById('searchInput').value.toLowerCase();
        const categoryValue = document.getElementById('categoriesFilter').value;
        const supplierValue = document.getElementById('supplierFilter').value;
        const rows = document.querySelectorAll('#productsTable tbody tr');
        
        rows.forEach(row => {
            const productName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const categoryId = row.dataset.categoryId;
            const supplierId = row.dataset.supplierId;
            
            const matchesSearch = productName.includes(searchValue);
            const matchesCategory = !categoryValue || categoryId === categoryValue;
            const matchesSupplier = !supplierValue || supplierId === supplierValue;
            
            if (matchesSearch &&  matchesCategory && matchesSupplier) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
});
