document.addEventListener('DOMContentLoaded', function () {
    const lowStockToast = new bootstrap.Toast(document.getElementById('lowStockToast'));

    // Function to check for low stock items
    async function checkLowStockItems() {
        try {
            const response = await fetch('/user_dashboard/low-stock');
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

    // Initially check for low stock items
    checkLowStockItems();

    // Update chart for user (this may not involve selecting stores)
    const ctx = document.getElementById('productQuantityChart').getContext('2d');
    const selectedStoreName = document.getElementById('selectedStoreName');

    // Initialize product chart
    const productChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['', '', '', '', ''],   // initial empty labels
            datasets: [{
                label: 'Quantity',
                data: [0, 0, 0, 0, 0],   // initial empty data
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgb(103, 103, 104)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    precision: 0
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Function to load top products for user-specific data
    async function loadTopProducts() {
        try {
            const response = await fetch('/user_dashboard/top-products-user');
            const products = await response.json();

            // Pad with blanks if fewer than 5 products
            const paddedProducts = [...products];
            while (paddedProducts.length < 5) {
                paddedProducts.push({ product_name: '', quantity: 0 });
            }

            // Capitalize product names correctly
            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            }

            // Update chart labels and data
            productChart.data.labels = paddedProducts.map(product => `${capitalize(product.product_name)}` || '');
            productChart.data.datasets[0].data = paddedProducts.map(p => p.quantity);
            productChart.update();
            
            // Update the selected store name dynamically (can be more general in a user dashboard context)
            selectedStoreName.textContent = 'Top quantity product';
        } catch (error) {
            console.error('Error fetching top products for user:', error);
        }
    }

    // Load user-specific top products
    loadTopProducts();

    // Load low stock chart (can be the same, since low stock is global data)
    async function loadLowStockChart() {
        try {
            const response = await fetch('/user_dashboard/low-stock-chart');
            const data = await response.json();

            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            }

            // Ensure only 5 products are displayed, if more than 5 are returned
            const limitedData = data.slice(0, 5);

            // Pad with empty data if fewer than 5 products
            while (limitedData.length < 5) {
                limitedData.push({ product_name: '', store_name: '', quantity: 0 });
            }

            // Prepare the labels and data arrays with placeholders
            const labels = limitedData.map(product => 
                product.product_name.trim() ? `${capitalize(product.product_name)} (${capitalize(product.store_name)})` : ''
            );

            const quantities = limitedData.map(product => product.quantity);

            // Create a new chart for low stock items
            const ctx = document.getElementById('lowStockChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,  // Product names and store names as labels
                    datasets: [{
                        label: 'Quantity Remaining',
                        data: quantities,  // Quantities of each product
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',  // Color for the bars
                        borderColor: 'rgb(65, 63, 63)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,  // Make sure chart is responsive to resizing
                    scales: {
                        x: {
                            barPercentage: 0.8,  // Control the width of bars
                            categoryPercentage: 0.8,  // Control spacing between bars
                        },
                        y: {
                            beginAtZero: true,
                            precision: 0
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching low stock data for user:', error);
        }
    }

    // Load the low stock chart when the page is ready
    loadLowStockChart();
});
