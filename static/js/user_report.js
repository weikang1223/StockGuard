document.addEventListener('DOMContentLoaded', () => {
    // Product filters
    const productSearch = document.getElementById('productSearch');
    const lowStockFilter = document.getElementById('lowStockFilter');
    const productRows = document.querySelectorAll('#productTable tbody tr');

    function filterProducts() {
        const search = productSearch.value.toLowerCase();
        const stockFilterValue = lowStockFilter.value;

        productRows.forEach(row => {
            const name = row.getAttribute('data-name').toLowerCase();
            const quantity = parseInt(row.getAttribute('data-quantity'), 10);

            const matchesName = name.includes(search);

            let matchesStock = true;

            if(stockFilterValue ==='out_of_stock'){
                matchesStock = quantity === 0;
            }  else if (stockFilterValue === 'very_low') {
                matchesStock = quantity < 10;
            } else if (stockFilterValue === 'low') {
                matchesStock = quantity >= 10 && quantity < 40;
            } else if (stockFilterValue === 'medium') {
                matchesStock = quantity >= 40 && quantity < 70;
            } else if (stockFilterValue === 'high') {
                matchesStock = quantity >= 70 && quantity < 100;
            } else if (stockFilterValue === 'very_high') {
                matchesStock = quantity >= 100;
            }   

            row.style.display = matchesName && matchesStock ? '' : 'none';
        });
    }

    // Event listeners for filters
    productSearch.addEventListener('input', filterProducts);
    lowStockFilter.addEventListener('change', filterProducts);
    
    // excel functionality 
    const exportExcelBtn = document.getElementById('exportExcelBtn');

    exportExcelBtn.addEventListener('click', () => {
        const table = document.getElementById('productTable');
        const wb = XLSX.utils.table_to_book(table, { sheet: "User Report" });

        // Save the Excel file
        XLSX.writeFile(wb, "user_report.xlsx");
    });
});
