class TokenManager {
	dodajToken = async function (parametri = {}) {
		let zaglavlje = new Headers();

		let token = await dajToken();

		zaglavlje.set("Authorization", token);
		parametri.headers = zaglavlje;

		return parametri;
	};

	dodajTokenIParametre = async function (tijelo) {
		let zaglavlje = new Headers();

		zaglavlje.set("Content-Type", "application/json");

		let token = await dajToken();
		zaglavlje.set("Authorization", token);
		let parametri = {
			method: "POST",
			body: JSON.stringify(tijelo),
			headers: zaglavlje,
		};

		return parametri;
	};

	dajToken = async function () {
		return (await fetch(`/baza/korisnici/token/prijava`)).headers.get(
			"Authorization"
		);
	};
}
