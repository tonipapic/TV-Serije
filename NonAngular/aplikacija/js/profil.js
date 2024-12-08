window.addEventListener("load", () => {
	new Profile().DohvatiPodatkeKorisnika();
});

class Profile extends TokenManager {
	DohvatiPodatkeKorisnika = async function () {
		let params = await this.dodajToken();
		let podaci = await fetch("/baza/korisnici/_getCurrent", params);

		let JSONpodaci = JSON.parse(await podaci.text())[0];

		let form = document.forms["update"].querySelectorAll("input, select");

		for (var item of form) {
			item.value = JSONpodaci[item.name];
		}

		let user = {
			Ime: undefined,
			Prezime: undefined,
			Email: undefined,
			Godina_rodenja: undefined,
			Spol: undefined,
			Drzava: undefined,
		};

		let buttonUpdate = document.getElementById("updateButton");
		buttonUpdate.addEventListener("click", async (event) => {
			event.preventDefault();
			for (var item of form) {
				user[item.name] = item.value;
			}
			let parmas = await dodajTokenIParametre(user);
			parmas.method = "PUT";
			console.log(parmas);
			let odg = await fetch(`/baza/korisnici/${user.Username}`, parmas);
			console.log(odg.status);
			window.location.reload();
		});
	};
}
