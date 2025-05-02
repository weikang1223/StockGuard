document.addEventListener('DOMContentLoaded', () => {
    const showProductsBtn = document.getElementById('showProductsBtn');
    const showTransactionsBtn = document.getElementById('showTransactionsBtn');
    const productList = document.getElementById('productList');
    const transactionList = document.getElementById('transactionList');

    // Toggle views for product list and transactions
    showProductsBtn.addEventListener('click', () => {
        productList.classList.remove('d-none');
        transactionList.classList.add('d-none');
    });

    showTransactionsBtn.addEventListener('click', () => {
        productList.classList.add('d-none');
        transactionList.classList.remove('d-none');
    });

    // Product filters
    const productSearch = document.getElementById('productSearch');
    const lowStockFilter = document.getElementById('lowStockFilter');
    const stockFilter = document.getElementById('stockFilter');
    const productRows = document.querySelectorAll('#productTable tbody tr');

    // Function to filter products based on filters
    function filterProducts() {
        const search = productSearch.value.toLowerCase();
        const lowStock = lowStockFilter.value === 'low';
        const selectedStore = stockFilter.value;

        productRows.forEach(row => {
            const name = row.getAttribute('data-name').toLowerCase();
            const quantity = parseInt(row.getAttribute('data-quantity'), 10);
            const storeId = row.getAttribute('data-store-id');

            const matchesName = name.includes(search);
            const matchesStock = !lowStock || quantity <= 10;
            const matchesStore = !selectedStore || storeId === selectedStore;

            // Show or hide the row based on the filters
            row.style.display = matchesName && matchesStock && matchesStore ? '' : 'none';
        });
    }

    // Event listeners for the filters
    productSearch.addEventListener('input', filterProducts);
    lowStockFilter.addEventListener('change', filterProducts);
    stockFilter.addEventListener('change', filterProducts);

    // Transaction filters
    const userFilter = document.getElementById('userFilter');
    const typeFilter = document.getElementById('typeFilter');
    const transactionRows = document.querySelectorAll('#transactionList tbody tr');

    function filterTransactions() {
        const userText = userFilter.value.toLowerCase();
        const type = typeFilter.value;

        transactionRows.forEach(row => {
            const username = row.getAttribute('data-user').toLowerCase();
            const txType = row.getAttribute('data-type');

            const matchesUser = username.includes(userText);
            const matchesType = !type || type === txType;

            row.style.display = matchesUser && matchesType ? '' : 'none';
        });
    }

    userFilter.addEventListener('input', filterTransactions);
    typeFilter.addEventListener('change', filterTransactions);
    
    exportProductListExcelBtn.addEventListener('click', () => {
        const table = document.getElementById('productTable');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Manager Product List  Report" });

        // Save the Excel file
        XLSX.writeFile(wb, "Manager_Product_List_report.xlsx");
    });

    exportTransactionExcelBtn.addEventListener('click', () => {
        const table = document.getElementById('transactionTable');
        const wb = XLSX.utils.table_to_book(table, { sheet: "Manager Transaction Report" });

        // Save the Excel file
        XLSX.writeFile(wb, "Manager_Transaction_report.xlsx");
    });
    
    
});
