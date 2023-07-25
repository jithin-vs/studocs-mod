
// Simulated form data with verification status (Replace with your own data)
const formData = [
  { formId: '1', name: 'John Doe', date: '2023-05-22', status: 'staff-adviser' },
  { formId: '2', name: 'Jane Smith', date: '2023-05-23', status: 'hod' },
  // Add more form data entries as needed
];

// Function to populate the table with form data
function populateFormTable() {
  const formTable = document.getElementById('formTable');

  // Clear existing table rows
  formTable.innerHTML = '';

  // Create and append table rows with form data
  formData.forEach(form => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${form.formId}</td>
      <td>${form.name}</td>
    `;
    row.addEventListener('click', () => {
      showFormData(form);
      setActiveForm(form.formId);
    });
    formTable.appendChild(row);
  });
}

// Function to display the form data in the formContent div
function showFormData(form) {
  const formContent = document.getElementById('formContent');
  formContent.innerHTML = `
    <h4>Form ID: ${form.formId}</h4>
    <p>Name: ${form.name}</p>
    <p>Date: ${form.date}</p>
    <p>Status: ${getStatusLabel(form.status)}</p>
    <!-- Additional form data goes here -->
  `;
}

// Function to set the active form in the status bar
function setActiveForm(formId) {
  const statusSteps = document.querySelectorAll('.status-step');
  statusSteps.forEach(step => {
    step.classList.remove('active-step');
    if (step.getAttribute('data-form-id') === formId) {
      step.classList.add('active-step');
    }
  });
}


// Function to determine the color of the status dot based on the status


// Function to set the active form in the status bar
function setActiveForm(formId) {
const statusDots = document.querySelectorAll('.status-dot');
statusDots.forEach(dot => {
dot.classList.remove('active-dot');
if (dot.getAttribute('data-form-id') === formId) {
dot.classList.add('active-dot');
}
});
}

// Function to show form data in the content area
function showFormData(form) {
const formContent = document.getElementById('formContent');
formContent.innerHTML = `
<h4>Form ID: ${form.formId}</h4>
<p>Name: ${form.name}</p>
<p>Date: ${form.date}</p>
<p>Status: ${form.status}</p>
<!-- Additional form data goes here -->
`;
}

// Call functions to populate table and status bar on page load
populateFormTable();
populateStatusBar();
