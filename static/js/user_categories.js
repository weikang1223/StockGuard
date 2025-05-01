document.addEventListener('DOMContentLoaded', function() {
    // Add Category functionality
    const addCategoryForm = document.getElementById('addCategoryForm');
    const addCategoryModal = new bootstrap.Modal(document.getElementById('addCategoryModal'));

    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addCategoryForm);
        
        try {
            const response = await fetch('/user_categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    categories_name: formData.get('categories_name')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Category added successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to add category'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding category');
        }
    });
    document.getElementById('searchInput').addEventListener('keyup', function() {
        const searchValue = this.value.toLowerCase();
        const rows = document.querySelectorAll('#categoriesTable tbody tr');
        
        rows.forEach(row => {
            const categoryName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            if (categoryName.includes(searchValue)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});