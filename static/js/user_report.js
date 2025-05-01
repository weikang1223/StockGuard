document.addEventListener('DOMContentLoaded', () => {
    // Product filters
    const productSearch = document.getElementById('productSearch');
    const lowStockFilter = document.getElementById('lowStockFilter');
    const productRows = document.querySelectorAll('#productTable tbody tr');

    function filterProducts() {
        const search = productSearch.value.toLowerCase();
        const lowStock = lowStockFilter.value === 'low';

        productRows.forEach(row => {
            const name = row.getAttribute('data-name').toLowerCase();
            const quantity = parseInt(row.getAttribute('data-quantity'), 10);

            const matchesName = name.includes(search);
            const matchesStock = !lowStock || quantity <= 10;

            row.style.display = matchesName && matchesStock ? '' : 'none';
        });
    }

    // Event listeners for filters
    productSearch.addEventListener('input', filterProducts);
    lowStockFilter.addEventListener('change', filterProducts);
});
