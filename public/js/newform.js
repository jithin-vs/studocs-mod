

// Retrieve the content from the respective elements with class "letter-preview"
var fromContent = document.querySelector("#letter-preview .from").innerHTML.trim();
var dateContent = document.querySelector("#letter-preview .date").innerHTML.trim();
var toContent = document.querySelector("#letter-preview .to").innerHTML.trim();
var subContent = document.querySelector("#letter-preview .sub").innerHTML.trim();
var para1Content = document.querySelector("#letter-preview .para1").innerHTML.trim();
var para2Content = document.querySelector("#letter-preview .para2").innerHTML.trim();
var endContent = document.querySelector("#letter-preview .end").innerHTML.trim();

// Function to replace content with input field value
var text = 1;
function replaceWithInputField(content) {
var replacedContent = content.replace(/#(\w+)/g, function (match, followingWord) {
 var inputId = "text" + (text++);
 return '<input  type="text" value="' + followingWord + '" class="' + inputId + '">';
});
return replacedContent;
}

function replaceWithInput(content) {
var replacedContent = content.replace(/#(\w+)/g, function (match, followingWord) {
 var inputId = "text" + (text++);
 return '<a class="' + inputId + '">' + followingWord + '</a>';
});
return replacedContent;
}


// Set the content in the corresponding sections within the "letter-preview" div
document.querySelector(".from").innerHTML = replaceWithInputField(fromContent);
document.querySelector(".date").innerHTML = replaceWithInputField(dateContent);
document.querySelector(".to").innerHTML = replaceWithInputField(toContent);
document.querySelector(".sub").innerHTML = replaceWithInputField(subContent);
document.querySelector(".para1").innerHTML = replaceWithInputField(para1Content);
document.querySelector(".para2").innerHTML = replaceWithInputField(para2Content);
document.querySelector(".end").innerHTML = replaceWithInputField(endContent);
text = 1;
document.querySelector("#letter-preview .from").innerHTML = replaceWithInput(fromContent);
document.querySelector("#letter-preview .date").innerHTML = replaceWithInput(dateContent);
document.querySelector("#letter-preview .to").innerHTML = replaceWithInput(toContent);
document.querySelector("#letter-preview .sub").innerHTML = replaceWithInput(subContent);
document.querySelector("#letter-preview .para1").innerHTML = replaceWithInput(para1Content);
document.querySelector("#letter-preview .para2").innerHTML = replaceWithInput(para2Content);
document.querySelector("#letter-preview .end").innerHTML = replaceWithInput(endContent);


// Get all the input fields and paragraphs with class names starting with "text"
$(document).ready(function() {
$('body').on('input', 'input[class^="text"]', function() {
 var newValue = $(this).val();
 var className = $(this).attr('class');
 $('a.' + className).text(newValue);
});
$('#letter-preview span').css('color', 'black');
});

