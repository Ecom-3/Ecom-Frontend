export const supportedLanguages = ['English', 'Hindi', 'Telugu'];
export const normalizeLanguage = (value) => supportedLanguages.includes(value) ? value : 'English';
let languagePreference = 'English';
export const readLanguage = () => languagePreference;
export const persistLanguage = (_storage, value) => {
  languagePreference = normalizeLanguage(value);
  return languagePreference;
};
