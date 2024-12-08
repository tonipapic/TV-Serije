class TMDBklijent {
	bazicniURL = "https://api.themoviedb.org/3";

	constructor(apiKljuc) {
		this.apiKljuc = apiKljuc;
	}

	async dohvatiSerije(filter) {
		let resurs = "/tv/popular";
		if (filter == undefined) {
			let odgovor = await this.obaviZahtjev(resurs);
			return odgovor;
		} else {
			let resurs = "/search/tv";
			let parametri = {
				sort_by: "popularity.desc",
				include_adult: false,
				query: filter,
			};

			let odgovor = await this.obaviZahtjev(resurs, parametri);
			return odgovor;
		}
	}

	async dohvatiSerijuPoId(id) {
		let resurs = "/tv/" + id;

		let odgovor = await this.obaviZahtjev(resurs);
		return odgovor;
	}

	async obaviZahtjev(resurs, parametri = "") {
		let zahtjev = this.bazicniURL + resurs + "?api_key=" + this.apiKljuc;
		for (let p in parametri) {
			console.log("Zahtjeve: " + p);
			zahtjev += "&" + p + "=" + parametri[p];
		}
		console.log(zahtjev);
		let odgovor = await fetch(zahtjev);
		let rezultat = await odgovor.text();
		return rezultat;
	}
}

module.exports = TMDBklijent;
