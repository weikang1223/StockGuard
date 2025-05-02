document.addEventListener('DOMContentLoaded', () => {
    // Initialize DataTable
    document.getElementById('transactionFilter').addEventListener('change', function() {
        const filterValue = this.value.toLowerCase();
        const rows = document.querySelectorAll('.transaction-row');

        rows.forEach(row => {
            const transactionType = row.getAttribute('data-transaction-type');
            row.style.display = (!filterValue || transactionType.includes(filterValue)) ? '' : 'none';
        });
    });

    const transactionFilter = document.getElementById('transactionFilter');
    const createdByFilter = document.getElementById('createdByFilter');
    const rows = document.querySelectorAll('.transaction-row');

    function applyFilters() {
        const typeValue = transactionFilter.value.toLowerCase();
        const userValue = createdByFilter.value.toLowerCase();

        rows.forEach(row => {
            const transactionType = row.getAttribute('data-transaction-type').toLowerCase();
            const createdBy = row.getAttribute('data-created-by').toLowerCase();

            const matchesType = !typeValue || transactionType.includes(typeValue);
            const matchesUser = !userValue || createdBy.includes(userValue);

            row.style.display = (matchesType && matchesUser) ? '' : 'none';
        });
    }

    transactionFilter.addEventListener('change', applyFilters);
    createdByFilter.addEventListener('change', applyFilters);

    
});
