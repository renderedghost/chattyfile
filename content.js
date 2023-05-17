// Define CSS as a string
const styles = `
:root {
  --color-success: #19c37d;
  --color-action: #2563eb;
  --color-action-hover: #1248c1;
  --color-error: #ef4146;
  --surface-primary: #202123;
  --surface-default: #353740;
  --surface-secondary: #6e6e80;
  --text-primary: #202123;
  --text-default: #353740;
  --text-secondary: #6e6e80;
  --text-disabled: #acacbe;
  --text-primary-inverted: #ffffff;
  --text-error: var(--color-error)
}

.custom-button {
  background-color: var(--color-action);
  color: var(--text-primary-inverted);
  padding: 4px;
  border: none;
  border-radius: 4px;
  margin-bottom: 8px;
}

.custom-button:hover {
  background-color: var(--color-action-hover);
}

.progress-container {
  width: 100%;
  height: 8px;
  background-color: var(--surface-secondary);
  margin-bottom: 8px;
  border-radius: 2px;
}

.progress-bar {
  width: 0%;
  height: 100%;
  background-color: var(--surface-primary);
}

.progress-bar-loading {
  background-color: var(--color-action);
}

.progress-bar-complete {
  background-color: var(--color-success);
}

.chunk-size-input {
  // margin-bottom: 8px;
  margin: 0 8px 8px 8px;
  width: 128px;
  color: var(--text-primary-inverted);
  font-size: 14px;
  height: 32px;
  background-color: var(--surface-primary);
  border-color: var(--surface-primary);
  border-radius: 4px;
  padding: 0 8px;
  border-width: 1px;
}

.chunk-size-label {
  font-size: 14px;
  color: var(--text-disabled);
}`;

// Create new style element
const styleElement = document.createElement("style");

// Append the CSS string to the style element
styleElement.innerHTML = styles;

// Append the style element to the document head
document.head.appendChild(styleElement);

// UI Creation Functions
function createButton() {
  const button = document.createElement("button");
  button.innerText = "Select File";
  button.classList.add('custom-button');
  return button;
}

function createProgressBar() {
  const progressContainer = document.createElement("div");
  progressContainer.classList.add('progress-container');

  const progressBar = document.createElement("div");
  progressBar.classList.add('progress-bar');
  progressContainer.appendChild(progressBar);

  return { progressContainer, progressBar };
}

let chunkSizeInput; // Declare chunkSizeInput as a global variable

function createChunkSizeInput() {
  chunkSizeInput = document.createElement("input");
  chunkSizeInput.type = "number";
  chunkSizeInput.min = "1";
  chunkSizeInput.max = "15000";
  chunkSizeInput.value = "15000";
  chunkSizeInput.classList.add('chunk-size-input');

  const chunkSizeLabel = document.createElement("label");
  chunkSizeLabel.innerText = "Limit upload to";
  chunkSizeLabel.appendChild(chunkSizeInput);
  chunkSizeLabel.classList.add('chunk-size-label');

  const maxLabel = document.createElement("label");
  maxLabel.innerText = "characters at a time. Maximum 15000.";
  maxLabel.classList.add('chunk-size-label');
  chunkSizeLabel.appendChild(maxLabel);

  return chunkSizeLabel;
}

// Event Handlers
async function handleButtonClick(progressBar) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt,.md,.js,.py,.html,.css,.json,.csv";
  input.addEventListener("change", async () => {
    handleFileChange(input, progressBar);
  });
  input.click();
}

async function submitConversation(text, part, filename) {
  const textarea = document.querySelector("textarea[tabindex='0']");
  const enterKeyEvent = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
  });
  textarea.value = `Part ${part} of ${filename}: \n\n ${text}`;
  textarea.dispatchEvent(enterKeyEvent);
}

async function handleFileChange(input, progressBar) {
  progressBar.style.width = "0%";
  progressBar.classList.add('progress-bar-loading');

  const file = input.files[0];
  const text = await file.text();

  const chunkSize = parseInt(chunkSizeInput.value);
  const numChunks = Math.ceil(text.length / chunkSize);

  for (let i = 0; i < numChunks; i++) {
    const chunk = text.slice(i * chunkSize, (i + 1) * chunkSize);
    await submitConversation(chunk, i + 1, file.name);
    progressBar.style.width = `${((i + 1) / numChunks) * 100}%`;
    await waitForChatGPT();
  }

  progressBar.classList.remove('progress-bar-loading');
  progressBar.classList.add('progress-bar-complete');
}

async function waitForChatGPT() {
  let chatgptReady = false;
  while (!chatgptReady) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    chatgptReady = !document.querySelector(".text-2xl > span:not(.invisible)");
  }
}

// Main Code
const button = createButton();
const { progressContainer, progressBar } = createProgressBar();
const chunkSizeLabel = createChunkSizeInput();

button.addEventListener("click", async () => {
  handleButtonClick(progressBar);
});

const targetSelector = ".flex.flex-col.w-full.py-2.flex-grow.md\\:py-3.md\\:pl-4";
const intervalId = setInterval(() => {
  const targetElement = document.querySelector(targetSelector);
  if (targetElement && !targetElement.contains(button)) {
    targetElement.parentNode.insertBefore(progressContainer, targetElement);
    targetElement.parentNode.insertBefore(button, targetElement);
    targetElement.parentNode.insertBefore(chunkSizeLabel, targetElement);
  }
}, 5000);
