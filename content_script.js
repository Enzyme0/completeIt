const key = "ENTER YOUR KEY"
function getActiveElementValue() {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName.toLowerCase() === 'input' && activeElement.type === 'text') {
      return activeElement.value;
    } else {
      return null;
    }
  }

async function openai(input, model)
{
    //use fetch instead of axios
    const data =
    {
        model: model,
        messages: [{"role": "user", "content": "your job is to act as text completion: do not add anything besides completing the the text Here is the text: " + input}],
        temperature: 0.7,
        max_tokens: 1500
    }
    const response = await postData('https://api.openai.com/v1/chat/completions', data);
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
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
    const newText = await openai(input, "gpt-3.5-turbo");
    return newText;
  }
  
  async function handleKeyDown(event) {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'g') {
      const activeElement = document.activeElement;
      //check to see if the input element can handle multiple lines
      if(activeElement && activeElement.tagName.toLowerCase() === 'textarea')
        {
            const value = activeElement.value;
            activeElement.value = activeElement.value + ' loading auto generate...';
            const newText = await getNewText(value);
            activeElement.value = value + newText;
            return;
        }
      if (activeElement && activeElement.tagName.toLowerCase() === 'input' && activeElement.type === 'text') {
        const value = activeElement.value;
        activeElement.value = activeElement.value + ' loading auto generate...';
        const newText = await getNewText(value);
        const newTest = newText.replace(/(\r\n|\n|\r)/gm, "");
        activeElement.value = value + newTest;
        return;
      } else {
        console.log('No active text input found');
      }
    }
  }
  
  document.addEventListener('keydown',  handleKeyDown);
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getActiveElementValue') {
      sendResponse(getActiveElementValue());
    }
  });
  
