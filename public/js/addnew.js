 function sendDivContent() {
     function getURLParameters() {
          const queryString = window.location.search.slice(1);
          const params = {};

          if (queryString) {
            const paramPairs = queryString.split('&');
            paramPairs.forEach(pair => {
              const [key, value] = pair.split('=');
              params[key] = decodeURIComponent(value);
            });
          }

          return params;
        }

      const parameters = getURLParameters();
      const name = parameters.name;

    var divContent = document.getElementById("letter-preview").innerHTML;
   
 
    // Create an AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/save-template?name=" + encodeURIComponent(name)+ '&id="<%=id%>"', true);
    xhr.setRequestHeader("Content-Type", "application/json");

    // Send the div content to the server
    xhr.send(JSON.stringify({ content: divContent }));

    // Handle the response from the server
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        console.log(response.message);
      }
    };
  }