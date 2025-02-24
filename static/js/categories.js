document.addEventListener('DOMContentLoaded', function() {
    // Add Category functionality
    const addCategoryForm = document.getElementById('addCategoryForm');
    const addCategoryModal = new bootstrap.Modal(document.getElementById('addCategoryModal'));

    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addCategoryForm);
        
        try {
            const response = await fetch('/categories', {
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

    // Edit Category functionality
    const editButtons = document.querySelectorAll('.edit-btn');
    const editCategoryModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    const editCategoryForm = document.getElementById('editCategoryForm');

    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('editCategoryId').value = button.dataset.id;
            document.getElementById('editCategoryName').value = button.dataset.name;
            editCategoryModal.show();
        });
    });

    editCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(editCategoryForm);
        const id = formData.get('id');
        
        try {
            const response = await fetch(`/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    categories_name: formData.get('categories_name')
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('Category updated successfully!');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to update category'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating category');
        }
    });

    // Delete Category functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const deleteCategoryModal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
    let categoryToDelete = null;

    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryToDelete = button.dataset.id;
            deleteCategoryModal.show();
        });
    });

    document.getElementById('confirmDeleteCategory').addEventListener('click', async () => {
        if (categoryToDelete) {
            try {
                const response = await fetch(`/categories/${categoryToDelete}`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Category deleted successfully!');
                    window.location.reload();
                } else {
                    alert('Error: ' + (result.message || 'Failed to delete category'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting category');
            }
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