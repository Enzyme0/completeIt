    document.getElementById('generateImage').addEventListener('click', async () => {
    const input = document.getElementById('input').value;
  
    // Send a message to the content script requesting image generation
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        await chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "generateImage", input: input },
          (response) => {
            const url =  response;
            chrome.tabs.create({ url: url });
          }
        );
      });
      
  });
  document.getElementById('generateText').addEventListener('click', async () => {
    const input = document.getElementById('input').value;
    //set output to loading text
    document.getElementById('status').textContent  = "Loading...";
    // Send a message to the content script requesting text generation
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        await chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "generateText", input: input },
          (response) => {
            const text =  response;
            document.getElementById('status').textContent  = "";
            document.getElementById('output').textContent  = text;
          }
        );
      }); 
  });
  
  