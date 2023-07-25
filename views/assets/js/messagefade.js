// Wait for the page to load
document.addEventListener("DOMContentLoaded", function() {
    // Get the connecting and message elements
    var message = document.getElementById("message");
    
    // Set a timeout to start fading out the message after 5 seconds
    setTimeout(function() {
      message.style.opacity = "0";
    }, 2000);
  });
  