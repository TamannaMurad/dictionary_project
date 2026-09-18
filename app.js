const playButton = document.querySelector("#playAudio");
const searchBtn = document.querySelector("#searchBtn");
const input = document.querySelector("#wordInput");
const loading = document.querySelector("#loading");

let audioUrl = "";

searchBtn.addEventListener("click", searchWord);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchWord();
  }
});

async function searchWord() {
  const word = input.value.trim();

  if (!word) {
    alert("Please enter a word.");
    return;
  }

  loading.textContent = "Searching...";

  const definitions = [];
  const synonyms = [];
  const antonyms = [];

  const entry = await getWordData(word);

  loading.textContent = "";

  if (!entry) {
    return;
  }

  // Reset previous audio
  audioUrl = "";

  // Find pronunciation audio
  for (const phonetic of entry.phonetics || []) {
    if (phonetic.audio) {
      audioUrl = phonetic.audio;
      break;
    }
  }

  playButton.disabled = !audioUrl;

  // Get definitions, synonyms and antonyms
  entry.meanings.forEach((meaning) => {
    synonyms.push(...(meaning.synonyms || []));
    antonyms.push(...(meaning.antonyms || []));

    meaning.definitions.forEach((def) => {
      definitions.push(def.definition);

      synonyms.push(...(def.synonyms || []));
      antonyms.push(...(def.antonyms || []));
    });
  });

  // Remove duplicate synonyms and antonyms
  const uniqueSynonyms = [...new Set(synonyms)];
  const uniqueAntonyms = [...new Set(antonyms)];

  const defs = `📖 Definitions

• ${definitions.join("\n• ")}`;

  const syns = `🔹 Synonyms

${uniqueSynonyms.length ? uniqueSynonyms.join(", ") : "No synonyms found"}`;

  const ants = `🔸 Antonyms

${uniqueAntonyms.length ? uniqueAntonyms.join(", ") : "No antonyms found"}`;

  show([defs, syns, ants]);
}

playButton.addEventListener("click", () => {
  if (audioUrl) {
    new Audio(audioUrl).play();
  }
});

function show(collections) {
  const list = document.querySelector("#ul");

  list.innerHTML = "";

  collections.forEach((text) => {
    const li = document.createElement("li");

    li.textContent = text;

    list.appendChild(li);
  });
}

async function getWordData(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;

  try {
    const response = await axios.get(url);

    return response.data[0];
  } catch (error) {
    console.error("API Error:", error);

    if (error.response) {
      // API responded with an error
      if (error.response.status === 404) {
        alert("Word not found.");
      } else {
        alert(`API Error: ${error.response.status}`);
      }
    } else if (error.request) {
      // Request was sent but no response was received
      alert("Unable to connect to the Dictionary API. Please try again later.");
    } else {
      // Something went wrong while creating the request
      alert("Something went wrong. Please try again.");
    }

    return null;
  }
}
