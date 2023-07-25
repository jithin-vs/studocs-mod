
const form = document.getElementById("thisform");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("re-password");
const messageDiv = document.getElementById("message");
const optionInputs = document.getElementsByName("inlineRadioOptions");

form.addEventListener("submit", function(event) {
  event.preventDefault();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  let option = "";

  for (let i = 0; i < optionInputs.length; i++) {
    if (optionInputs[i].checked) {
      option = optionInputs[i].value;
      break;
    }
  }

   if (option === "no") {
    messageDiv.textContent = "Please select 'Yes' to submit the form.";
    messageDiv.classList.remove("alert-success");
    messageDiv.classList.add("alert-danger");
  } else {
    messageDiv.textContent = "";
    messageDiv.classList.remove("alert-danger");
    messageDiv.classList.add("alert-success");
    form.submit();
  }
});

// Additional event listener for password and confirm password inputs
passwordInput.addEventListener("input", function() {
  const password = passwordInput.value;
  if (password.length < 8) {
    messageDiv.textContent = "Password should be at least 8 characters long!";
    messageDiv.classList.remove("alert-success");
    messageDiv.classList.add("alert-danger");
  } else {
    messageDiv.textContent = "";
    messageDiv.classList.remove("alert-success");
    messageDiv.classList.remove("alert-danger");
  }
});

confirmPasswordInput.addEventListener("input", function() {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  if (password !== confirmPassword) {
    messageDiv.textContent = "Passwords do not match!";
    messageDiv.classList.remove("alert-success");
    messageDiv.classList.add("alert-danger");
  } else {
    messageDiv.textContent = "";
    messageDiv.classList.remove("alert-success");
    messageDiv.classList.remove("alert-danger");
  }
});
