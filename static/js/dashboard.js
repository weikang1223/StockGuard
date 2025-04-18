document.addEventListener('DOMContentLoaded', function () {
    const lowStockToast = new bootstrap.Toast(document.getElementById('lowStockToast'));

    async function checkLowStockItems() {
        try {
            const response = await fetch('/dashboard/low-stock');
            const data = await response.json();

            if (data.length > 0) {
                let message = '<div class="mb-2"><strong>Low Stock Products:</strong></div>';
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

    const ctx = document.getElementById('productQuantityChart').getContext('2d');
    const storeFilter = document.getElementById("storeFilter");
    const selectedStoreName = document.getElementById('selectedStoreName');
    
    // ✅ Use productChart instead of chart
    const productChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['', '', '', '', '',''],   // able to change 
            datasets: [{
                label: 'Quantity',
                data: [0, 0, 0, 0, 0, 0 ],   // able to change 
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

    const savedStoreId = localStorage.getItem('selectedStore');
if (savedStoreId) {
    storeFilter.value = savedStoreId;
    loadTopProducts(savedStoreId);
}

// Event listener for dropdown change
storeFilter.addEventListener('change', function () {
    const storeId = this.value;
    localStorage.setItem('selectedStore', storeId);
    loadTopProducts(storeId);
});

// Function to load products for selected store
async function loadTopProducts(storeId) {
    try {
        const response = await fetch(`/dashboard/top-products/?store_id=${storeId}`);
        const products = await response.json();

        // Pad with blanks if fewer than 5 products
        const paddedProducts = [...products];
        while (paddedProducts.length < 5) {
            paddedProducts.push({ product_name: '', quantity: 0 });
        }

         // capitalize product name correctly
        function capitalize(str){
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
         //  update chart labels and data 
        productChart.data.labels = paddedProducts.map(product => `${capitalize(product.product_name)}` || '');
        productChart.data.datasets[0].data = paddedProducts.map(p => p.quantity);
        productChart.update();
        
        // update the selected store name dynamically 
        const selectedStore = document.querySelector(`#storeFilter option[value="${storeId}"]`).textContent;
        selectedStoreName.textContent = `Store: ${selectedStore}`;
    } catch (error) {
        console.error('Error fetching top products:', error);
    }
}


    async function loadLowStockChart() {
        try {
            const response = await fetch('/dashboard/low-stock-chart');
            const data = await response.json();

            function capitalize(str){
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            }

            // Check if there are any low stock items
            if (data.length > 0) {
                const ctx = document.getElementById('lowStockChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.map(product => `${capitalize(product.product_name)} (${capitalize(product.store_name)})`), // Product names and store name as labels
                        datasets: [{
                            label: 'Quantity Remaining',
                            data: data.map(product => product.quantity), // Quantities of each product
                            backgroundColor: 'rgba(255, 99, 132, 0.6)', // Color for the bars
                            borderColor: 'rgb(65, 63, 63)',
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
            } else {
                console.log('No low stock items found.');
            }
        } catch (error) {
            console.error('Error fetching low stock data:', error);
        }
    }

    // Load the low stock chart when the page is ready
    loadLowStockChart();
});

