// Global state for localization
let currentLanguage = 'fr';
let translations = {};

function applyTranslations() {
    console.log("applyTranslations called for language:", currentLanguage);
    console.log("Current translations:", translations);

    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        console.log(`Translating element with key: ${key}`);
        const translatedString = getString(key);
        console.log(`Translation for ${key}:`, translatedString);

        if (element.tagName === 'TITLE') {
            document.title = translatedString;
        } else if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
            element.value = translatedString;
        } else {
            // A simple heuristic to check if the string contains HTML.
            // If it does, use innerHTML, otherwise textContent.
            // This assumes that keys for elements expecting HTML (like paragraphs with <strong>)
            // will have that HTML in their translation strings.
            if (/[<>]/.test(translatedString) && translatedString !== key && !translatedString.startsWith('Key_Not_Found:')) {
                element.innerHTML = translatedString;
            } else {
                element.textContent = translatedString;
            }
        }
    });
}

async function setLanguage(lang) {
    console.log("setLanguage called with:", lang);
    try {
        console.log(`Fetching translations for ${lang}...`);
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            // If the specific language file is not found, try to construct a more informative error.
            let errorMsg = `Failed to load translation file for ${lang}: ${response.statusText}`;
            if (response.status === 404) {
                errorMsg = `Translation file locales/${lang}.json not found.`;
            }
            throw new Error(errorMsg);
        }
        const data = await response.json();
        console.log(`Loaded translations for ${lang}:`, data);
        translations = data;
        const oldLanguage = currentLanguage;
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        console.log(`Language set to ${lang}`);

        // Only call applyTranslations if the language actually changed or if it's the initial load
        if (oldLanguage !== currentLanguage || Object.keys(translations).length > 0) {
            applyTranslations();
            updateLangSelector(); // Update dropdown after applying translations
        }

    } catch (error) {
        console.error(`Error setting language to ${lang}:`, error);
        // Fallback only if the requested language is not the default and the default is not already the current one
        if (lang !== 'fr' && currentLanguage !== 'fr') {
            console.warn('Falling back to French.');
            await setLanguage('fr'); // Fallback to French
        } else if (lang === 'fr' && Object.keys(translations).length === 0) {
            // If French itself failed to load initially, there's a fundamental issue.
            console.error("Critical: Default French translation file failed to load.");
            translations = {}; // Ensure translations are empty
            // Optionally, display a user-facing error message on the page here
        }
    }
}

function getString(key, placeholders = {}) {
    // Navigate through nested keys if key is like "object.property"
    const keys = key.split('.');
    let string = translations;
    for (const k of keys) {
        if (string && typeof string === 'object' && k in string) {
            string = string[k];
        } else {
            // Key not found at some point in the path
            return `Key_Not_Found: [${key}]`;
        }
    }

    if (typeof string !== 'string') {
        // The path led to something other than a string
        return `Invalid_Key_Type: [${key}] (expected string, got ${typeof string})`;
    }

    for (const placeholder in placeholders) {
        // Use a more robust regex for placeholders, e.g., {placeholderName}
        const regex = new RegExp(`\\{${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`, 'g');
        string = string.replace(regex, placeholders[placeholder]);
    }
    return string;
}

async function initializeLocalization() {
    const preferredLanguage = localStorage.getItem('preferredLanguage');
    // Set a default language if nothing is in localStorage, to ensure `translations` is populated.
    await setLanguage(preferredLanguage || 'fr');
}

function updateLangSelector() {
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = currentLanguage;
    }
}

// Initialize localization and set up event listener after DOM is loaded
console.log("i18n.js script loaded");
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - Initializing localization");
    const langSelect = document.getElementById('lang-select');
    console.log("Language selector found:", langSelect);
    
    if (langSelect) {
        console.log("Setting up language selector event listener");
        langSelect.addEventListener('change', (event) => {
            console.log("Language selector changed to:", event.target.value);
            setLanguage(event.target.value);
        });
    }

    initializeLocalization().then(() => {
        console.log("Localization initialized");
        if (langSelect) {
            updateLangSelector();
        }
    }).catch(error => {
        console.error("Error during localization initialization:", error);
    });
});
