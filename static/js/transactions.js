document.addEventListener('DOMContentLoaded', () => {
    // Initialize DataTable
    $('#transactionsTable').DataTable({
        order: [[3, 'desc']], // Sort by Date
        pageLength: 25
    });

    // filter out transactions functionality
    document.getElementById('transactionFilter').addEventListener('change', function () {
        filterTransactions();
    });
   
    function filterTransactions() {
        const transactionValue = document.getElementById('transactionFilter').value.toLowerCase();
        const rows = document.querySelectorAll('#transactionsTable tbody tr');

        rows.forEach(row => {
            const transactionType = row.querySelector('td:nth-child(5)').textContent.trim().toLowerCase();
            row.style.display = (!transactionValue || transactionType.includes(transactionValue)) ? '' : 'none';
        });
    }
});
