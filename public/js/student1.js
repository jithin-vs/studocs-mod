document.addEventListener('DOMContentLoaded', function () {
  const plusIcon = document.querySelector('.plus-icon');
  const uploadOption = document.querySelector('.upload-option');
  const uploadContainer = document.querySelector('.upload-container');

  plusIcon.addEventListener('click', function () {
    const attachmentName = prompt('Enter the name for the attachment:');
    if (attachmentName) {
      uploadOption.setAttribute('data-name', attachmentName);
      uploadOption.click();
    }
  });

  function getUrlValue() {
    const urlPath = window.location.pathname;
    const value = urlPath.split('/')[2]; // Assumes the value is at index 2
    return value;
  }

  uploadOption.addEventListener('change', function () {
    const files = Array.from(uploadOption.files);

    files.forEach(function (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('attaname', uploadOption.getAttribute('data-name'));

      fetch(`/upload?id=${getUrlValue()}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then((response) => {
          if (response.ok) {
            console.log('Attachment uploaded successfully');
          } else {
            throw new Error('Failed to upload attachment');
          }
        })
        .catch((error) => {
          console.error('Error occurred during attachment upload:', error);
        });

      const card = document.createElement('div');
      card.classList.add('card');

      const cardContent = document.createElement('div');
      cardContent.classList.add('card-content');
      cardContent.textContent = file.name;

      const cardActions = document.createElement('div');
      cardActions.classList.add('card-actions');

      const reuploadIcon = document.createElement('span');
      reuploadIcon.classList.add('reupload-icon');
      reuploadIcon.textContent = '↻';

      const deleteIcon = document.createElement('span');
      deleteIcon.classList.add('delete-icon');
      deleteIcon.textContent = '❌';

      cardActions.appendChild(reuploadIcon);
      cardActions.appendChild(deleteIcon);

      card.appendChild(cardContent);
      card.appendChild(cardActions);
      uploadContainer.appendChild(card);
    });
  });

  uploadContainer.addEventListener('click', function (event) {
    const target = event.target;
    if (target.classList.contains('reupload-icon')) {
      const card = target.closest('.card');
      const cardContent = card.querySelector('.card-content');
      const fileName = cardContent.textContent;
      uploadOption.value = null;
      const attachmentName = prompt('Enter the new name for the attachment:');
      if (attachmentName) {
        uploadOption.setAttribute('data-name', attachmentName);
        uploadOption.click();
      }
      uploadOption.addEventListener('change', function () {
        const newFile = Array.from(uploadOption.files)[0];
        cardContent.textContent = newFile.name;
        // Perform the reupload logic here...
      });
    } else if (target.classList.contains('delete-icon')) {
      const card = target.closest('.card');
      card.remove();
      // Perform the deletion logic here...
    }
  });
});
