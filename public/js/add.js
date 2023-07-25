function confirmDelete(id) {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteEntry(id);
    }
  }
  
  function deleteEntry(id) {
    fetch(`/deleteuser?id=${id}&user=principal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(response => {
      if (response.ok) {
        // Refresh the page without changing the URL
        window.location.reload(false);
      } else {
        alert('Server error occurred. Entry could not be deleted.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Entry could not be deleted.');
    });
  }