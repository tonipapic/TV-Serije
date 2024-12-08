const ds = require("fs/promises");

class Konfiguracija {
	constructor() {
		this.konf = {};
		this.opis = { opis: undefined };
	}
	dajKonf() {
		return this.konf;
	}
	dajOpis() {
		return this.opis;
	}
	dajPutanju() {
		return __dirname;
	}

	async pripremiKonfiguraciju() {
		let podaci = await ds.readFile(process.argv[2], "UTF-8");
		this.konf = pretvoriJSONkonfig(podaci);
		console.log(this.konf);
	}

	ValidateFile = function (podaci) {
		let missing = MissingValue(podaci);

		if (missing) {
			this.opis.opis = "Nedostaje vrijednost za podatak " + missing;
			return false;
		}
		const regex = new RegExp(/^[a-zA-Z0-9]+$/);
		for (let item in podaci) {
			switch (item) {
				case "jwtValjanost":
					if (
						!(3600 >= parseInt(podaci[item]) && parseInt(podaci[item]) >= 15)
					) {
						this.opis.opis = "jwtValjanost mora biti između 15 i 3600";
						return false;
					}
					break;
				case "jwtTajniKljuc":
					if (!(50 < podaci[item].length) && podaci[item].length > 100) {
						this.opis.opis = "jwtTajniKljuc mora imati između 50 i 100 znakova";
						return false;
					} else if (!regex.test(podaci[item])) {
						this.opis.opis =
							"jwtTajniKljuc smije sadrzavati samo brojeve i velika i mala slova";
						return false;
					}

					break;
				case "tajniKljucSesija":
					if (!(50 < podaci[item].length) && podaci[item].length > 100) {
						this.opis.opis =
							"tajniKljucSesija mora imati između 50 i 100 znakova";
						return false;
					} else if (!regex.test(podaci[item])) {
						this.opis.opis = "tajniKljucSesija smije sadrzavati samo brojeve";
						return false;
					}
					break;
				case "appStranicenje":
					if (!(100 >= parseInt(podaci[item]) && parseInt(podaci[item]) >= 5)) {
						this.opis.opis = "appStranicenje mora biti između 5 i 100";
						return false;
					}
					break;
				case "tmdbApiKeyV3":
					break;
				case "tmdbApiKeyV4":
					break;
				default:
					break;
			}
		}
		this.opis.opis = "200";
		return true;
	};
}

function pretvoriJSONkonfig(podaci) {
	let konf = {
		jwtValjanost: undefined,
		jwtTajniKljuc: undefined,
		tajniKljucSesija: undefined,
		appStranicenje: undefined,
		tmdbApiKeyV3: undefined,
		tmdbApiKeyV4: undefined,
	};
	var nizPodataka = podaci.split("\r\n");
	for (let podatak of nizPodataka) {
		var podatakNiz = podatak.split(":");
		var naziv = podatakNiz[0];
		var vrijednost = podatakNiz[1];
		konf[naziv] = vrijednost;
	}

	return konf;
}

function MissingValue(podaci) {
	for (let item in podaci) {
		if (
			!(podaci[item] != null && podaci[item] != undefined && podaci[item] != "")
		)
			return item;
	}
	return false;
}

module.exports = Konfiguracija;
