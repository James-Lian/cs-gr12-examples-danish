/**
 * @name Wordnik
 *
 * @class
 *
 * @description Accesses the Wordnik API
 *
 * @public {String} apiKey - the key to access the API service
 * @public {String} baseUrl - the URL used to access Wordnik services
 */
class Wordnik {
	constructor(apiKey) {
		this.apiKey = apiKey;
		this.baseUrl = "https://api.wordnik.com/v4";
	}
	
	/** 
		* @method getRandomWord
		* @description Gets random word
	*/
	getRandomWord() {
		let url = `${this.baseUrl}/words.json/randomWord?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=${this.apiKey}`;
		
		console.log("Wordnik: Retrieving random word.");
		return fetch(url);
	}
	
	/** 
		* @method getDefinitions
		* @description gets definitions
	*/
	getDefinitions(word) {
		let url = `${this.baseUrl}/word.json/${word}/definitions?limit=1&includeRelated=false&useCanonical=true&includeTags=false&api_key=${this.apiKey}`
		
		console.log(`Wordnik: Retrieving definitions for "${word}".`);
		return fetch(url);
	}
}
