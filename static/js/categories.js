document.addEventListener('DOMContentLoaded', function () {
  // Add Category functionality
  const addCategoryForm = document.getElementById('addCategoryForm');
  const addCategoryModal = new bootstrap.Modal(
    document.getElementById('addCategoryModal')
  );

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
          categories_name: formData.get('categories_name'),
        }),
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
  const editCategoryModal = new bootstrap.Modal(
    document.getElementById('editCategoryModal')
  );
  const editCategoryForm = document.getElementById('editCategoryForm');

  editButtons.forEach((button) => {
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
          categories_name: formData.get('categories_name'),
        }),
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
  const deleteCategoryModal = new bootstrap.Modal(
    document.getElementById('deleteCategoryModal')
  );
  let categoryToDelete = null;

  deleteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      categoryToDelete = button.dataset.id;
      deleteCategoryModal.show();
    });
  });

  document
    .getElementById('confirmDeleteCategory')
    .addEventListener('click', async () => {
      if (categoryToDelete) {
        try {
          const response = await fetch(`/categories/${categoryToDelete}`, {
            method: 'DELETE',
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

  document
    .getElementById('searchInput')
    .addEventListener('keyup', function () {
      const searchValue = this.value.toLowerCase();
      const rows = document.querySelectorAll('#categoriesTable tbody tr');

      rows.forEach((row) => {
        const categoryName = row
          .querySelector('td:nth-child(2)')
          .textContent.toLowerCase();
        if (categoryName.includes(searchValue)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  const viewInventoryButtons = document.querySelectorAll('.view-inventory-btn');

  viewInventoryButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const categoryId = button.getAttribute('data-id');
      try {
        const response = await fetch(`/categories/${categoryId}`);
        const products = await response.json();

        const inventoryTableBody = document.getElementById('inventoryTableBody');
        inventoryTableBody.innerHTML = ''; // Clear previous data

        if (Array.isArray(products) && products.length > 0) {
          products.forEach((product) => {
            const quantity = product.quantity;
            let quantityClass = '';

            if (quantity === 0 || quantity === null || quantity === undefined) {
              quantityClass = 'text-danger font-weight-bold'; // red (out of stock)
            } else if (quantity < 10) {
              quantityClass = 'text-danger font-weight-bold'; // red (very low)
            } else if (quantity >= 10 && quantity < 40) {
              quantityClass = 'text-warning font-weight-bold'; // yellow (low)
            } else if (quantity >= 40 && quantity < 70) {
              quantityClass = 'text-info font-weight-bold'; // blue (medium)
            } else if (quantity >= 70 && quantity < 100) {
              quantityClass = 'text-primary font-weight-bold'; // primary (high)
            } else {
              quantityClass = 'text-success font-weight-bold'; // green (very high)
            }

            inventoryTableBody.innerHTML += `
                        <tr>
                            <td>${product.store_name}</td>
                            <td>${product.product_name}</td>
                            <td class="${quantityClass}">${
                              quantity !== null && quantity !== undefined
                                ? quantity
                                : '0'
                            }</td>
                        </tr>
                    `;
          });
        } else {
          inventoryTableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">No products found for this category</td>
                    </tr>
                `;
        }

        const inventoryModal = new bootstrap.Modal(
          document.getElementById('viewInventoryModal')
        );
        inventoryModal.show();
      } catch (error) {
        console.error('Error loading category product:', error);
        alert('Failed to load product. Please try again.');
      }
    });
  });
});