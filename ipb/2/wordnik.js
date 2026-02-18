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
		* @method getDefinitions
		* @description gets definitions
		* @param {string} [word] - The word for which the definition will be retrieved
	*/
	getDefinitions(word) {
		let url = `${this.baseUrl}/word.json/${word}/definitions?limit=1&includeRelated=false&useCanonical=true&includeTags=false&api_key=${this.apiKey}`;

		try {
			console.log(`Wordnik: Retrieving definitions for "${word}".`);
			return fetch(url);
		} catch {
			console.log("Error retrieving Wordnik definitions.")
			return {"error": "fetch request"}
		}
	}

	/** 
		* @method getTopExample
		* @description Gets the top example from Wordnik for the word
		* @param {string} [word] - The word for which the example will be retrieved
	*/
	getTopExample(word) {
		let url = `${this.baseUrl}/word.json/${word}/topExample?useCanonical=false&api_key=${this.apiKey}`;

		try {
			console.log(`Wordnik: Retrieving top example for "${word}".`);
			return fetch(url);
		} catch {
			console.log("Error retrieving Wordnik examples.")
			return {"error": "fetch request"}
		}
	}

	/** 
		* @method getScrabbleScore
		* @description Gets the scrabble score from Wordnik for the word
		* @param {string} [word] - The word for which the scrabble score will be retrieved
	*/
	getScrabbleScore(word) {
		let url = `${this.baseUrl}/word.json/${word}/scrabbleScore?api_key=${this.apiKey}`

		try{
			console.log(`Wordnik: Retrieving scrabble score for "${word}".`);
			return fetch(url);
		} catch {
			console.log("Error retrieving Wordnik scrabble score.")
			return {"error": "fetch request"}
		}
	}

	/** 
		* @method getRelatedWords
		* @description Gets the a list of related words from Wordnik for the word
		* @param {string} [word] - The word for which the related words will be retrieved
	*/
	getRelatedWords(word) {
		let url = `${this.baseUrl}/word.json/${word}/relatedWords?useCanonical=false&limitPerRelationshipType=3&api_key=${this.apiKey}`

		try{
			console.log(`Wordnik: Retrieving related words for "${word}".`);
			return fetch(url);
		} catch {
			console.log("Error retrieving Wordnik related wordss.")
			return {"error": "fetch request"}
		}
	}
}
