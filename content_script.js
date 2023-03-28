let key = "ADD YOUR KEY"
let model = "gpt-3.5-turbo";
function getActiveElementValue() {
  const activeElement = document.activeElement;
  const tagName = activeElement.tagName.toLowerCase();
  
  if (tagName === 'input' && ['text', 'url'].includes(activeElement.type)) {
    return activeElement.value;
  } else if (tagName === 'textarea' || activeElement.isContentEditable) {
    return activeElement.innerText || activeElement.textContent;
  } else {
    return null;
  }
}


function getModel()
{
    //read the browser storage for the model
    return model;
}
async function openai(input, model)
{
    //use fetch instead of axios
    const data =
    {
        model: model,
        messages: [{"role": "user", "content": "your job is to act as text completion: do not add anything besides completing the the text. You may also ask for more information if needed. Here is the text: " + input}],
        temperature: 0.7,
        max_tokens: 1500
    }
    const response = await postData('https://api.openai.com/v1/chat/completions', data);
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
}
async function chatAi(input)
{
    //use fetch instead of axios
    const data =
    {
        model: "gpt-4",
        messages: [{"role": "user", "content": input}],
        temperature: 0.7,
        max_tokens: 1500
    }
    const response = await postData('https://api.openai.com/v1/chat/completions', data);
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
}

function swapModel()
{
    switch(model)
    {
        case "gpt-3.5-turbo":
            model = "gpt-4";
            break;
        case "gpt-4":
            model = "gpt-3.5-turbo";
            break;
    }
}
async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
         "Authorization": "Bearer " + key,
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  
 async function getNewText(input) {
    // Replace this with your desired implementation of the getNewText() function.
    const newText = await openai(input, getModel());
    return newText;
  }
  
  async function handleKeyDown(event) {
    //check page https://raw.githubusercontent.com/Enzyme0/completeIt/7715ba07e4570bdbf14c8135ba3826f6a21b48ef/check.html
    if(event.ctrlKey && event.altKey && event.key.toLowerCase() === 'm')
    {
        swapModel();
        return;
    }
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'g') {
      const activeElement = document.activeElement;
      const tagName = activeElement.tagName.toLowerCase();
      const isTextInput = tagName === 'input' && ['text', 'url'].includes(activeElement.type);
      const isTextarea = tagName === 'textarea';
      const isContentEditable = activeElement.isContentEditable;
      //check to see if the input element can handle multiple lines
      if(isTextInput || isTextarea)
        {
            //get the place of the text cursor
            const cursorPos = activeElement.selectionStart;
            const value = activeElement.value;
            ///add "loading auto generate..." to the text, where the cursor is
            activeElement.value = value.substring(0, cursorPos) + "loading auto generate..." + value.substring(cursorPos);
            const newText = await getNewText(value);
            const curValue = activeElement.value;
            //find value after loading auto generate
            const index = curValue.indexOf("loading auto generate...");
            //remove loading auto generate
            //get the string that comes after loading auto generate, so people can type between the loading auto generate and the new text
            const newCurValue = curValue.substring(index + "loading auto generate...".length);
            //add new text
            activeElement.value = value + newText + newCurValue;
            return;
        }
        else if(isContentEditable)
        {
          const sel = window.getSelection();
          const range = sel.getRangeAt(0);
          const placeholder = 'loading auto generate...';
          const textNode = document.createTextNode(placeholder);
          range.insertNode(textNode);
          const newText = await getNewText(activeElement.innerText || activeElement.textContent);
          const parentNode = textNode.parentNode;
          parentNode.replaceChild(document.createTextNode(newText), textNode);
          return;
        }
        else{
          console.log("not a text input");
        }
    }
  }
  
  async function generateImage(prompt) {
    const data = {
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    };
  
    const response = await postData("https://api.openai.com/v1/images/generations", data);
    //copy response to keyboard (debugging)
    console.log(response);
    const imageUrl = response.data[0].url;
    return imageUrl;
  }
  
  function blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  }
  
  document.addEventListener('keydown',  handleKeyDown);
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getActiveElementValue') {
      sendResponse(getActiveElementValue());
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getActiveElementValue') {
      sendResponse(getActiveElementValue());
    } else if (request.action === 'generateText') {
      chatAi(request.input).then((response) => {
        console.log('getNewText response:', response); // Add this line
        sendResponse(response);
      });
      return true; // Required for async response
    } else if (request.action === 'generateImage') {
      generateImage(request.input).then((response) => {
        sendResponse(response);
      });
      return true; // Required for async response
    }
  });
  