
  function showtextarea(buttonId) {
  $("#text"+ buttonId).toggle();
}

function displayText() {
  var from = document.getElementById('text1').value.replace(/\n/g, "<br>&nbsp&nbsp");
  var date = document.getElementById('text2').value.replace(/\n/g, "<br>");
  var to = document.getElementById("text3").value.replace(/\n/g, "<br>&nbsp&nbsp");
  var subject = document.getElementById("text4").value.replace(/\n/g, "<br>");
  var paragraph1 = document.getElementById("text6").value.replace(/\n/g, "<br>");
  var paragraph2 = document.getElementById("text7").value.replace(/\n/g, "<br>");
  var ending = document.getElementById("text8").value.replace(/\n/g, "<br>");
  var letterPreview = document.getElementById("letter-preview");
console.log(ending);
  var content = "<strong>From,</strong> <div class='from'>&nbsp&nbsp" + from + "</div><div class='date'>" +
    date + "</div>" + "<strong>To,</strong><br> <div class='to'>&nbsp&nbsp" + to + "</div><br>" +
    "<div class='sub'><strong>Sub:</strong>" + subject + "</div><br>sir/madam,<br><div class='para1'>&nbsp&nbsp&nbsp&nbsp " +
    paragraph1 + "</div><div class='para2'>&nbsp&nbsp&nbsp&nbsp" + paragraph2 + "</div><br><div class='end'>" + ending +"</div><br><div class=remarks><br><div id=tutor></div><br><div id=hod></div><br><div id=principal></div><br></div><br><div class=attachment id=attachment></div>";

  var regex = /#\w+/g;
  var highlightedContent = content.replace(regex, '<span style="color: red;">$&</span>');
  letterPreview.innerHTML = highlightedContent;
}



function toggleTextArea(content, spanElement) 
{
  var textArea = document.createElement("textarea");
  textArea.classList.add("form-control");
  textArea.rows = "3";
  textArea.placeholder = "Enter text...";
  textArea.value = content.replace(/\n/g, '\r\n');
  spanElement.parentNode.appendChild(textArea);
  
  var icon = spanElement.querySelector("i");
  icon.classList.remove("fa-plus");
  icon.classList.add("fa-chevron-down");
  
  spanElement.onclick = function() {
    toggleTextAreaAndIcon(textArea, icon, this);
  };
}

function toggleTextAreaAndIcon(textArea, icon) {
  textArea.parentNode.removeChild(textArea);
  icon.classList.remove("fa-chevron-down");
  icon.classList.add("fa-plus");
  
  spanElement.onclick = function() {
    toggleTextArea(this);
  };
}
function tDate(){
  var date=document.getElementById('text2');
  date.value=getCurrentDate();
}
function getCurrentDate() {
  var currentDate = new Date();
  var day = String(currentDate.getDate()).padStart(2, '0');
  var month = String(currentDate.getMonth() + 1).padStart(2, '0');
  var year = currentDate.getFullYear();
  return `${day}-${month}-${year}`;
}

function generatePDF() {
  var panelElement = document.getElementById('letter-preview');
  
  // Calculate the total height of the scrollable panel
  var totalHeight = panelElement.scrollHeight;
  
  // Set the height of the panel to its full content height
  panelElement.style.height = totalHeight + 'px';

  // Create a new jsPDF instance
  var pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  // Function to capture the scrollable panel as an image
  function capturePanelImage() {
    panelElement.style.border = 'none';
    html2canvas(panelElement).then(canvas => {
      var imageData = canvas.toDataURL('image/png',1.0);
      var imgWidth = pdf.internal.pageSize.getWidth();
    var imgHeight = pdf.internal.pageSize.getHeight();
      
      // Add the captured image to the PDF
      pdf.addImage(imageData, 'PNG', 0, 0, imgWidth, imgHeight, '', 'FAST');

      // Check if there's more content to capture
      if (panelElement.scrollTop + panelElement.offsetHeight < totalHeight) {
        // Scroll down to the next position
        panelElement.scrollTop += panelElement.offsetHeight;

        // Call the capturePanelImage function recursively after a delay
        setTimeout(capturePanelImage, 500); // Adjust the delay if needed
      } else {
        // Save the PDF file
        pdf.save('download.pdf');

        // Reset the panel height to its original value
        panelElement.style.height = '';
      }
    });
  }

  // Call the capturePanelImage function to start capturing the panel content
  capturePanelImage();
}
