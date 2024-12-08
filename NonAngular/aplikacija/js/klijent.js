var currentRole = "";
window.addEventListener("load", async () => {
	try {
		await LoginAsGuest(false);
		currentRole = await (await getRole()).text();

		console.log(currentRole);
		if (window.location.href.includes("prijava")) {
			Login();
		} else if (window.location.href.includes("registracija")) {
			Register();
		} else if (window.location.href.includes("korisnici")) {
			await SviKorisnici();
		} else if (window.location.href.includes("detalji")) {
			await DohvatiDetaljiSerije();
		} else if (window.location.href.includes("profile")) {
			await DohvatiPodatkeKorisnika();
		} else if (window.location.href.includes("favourites")) {
			await DohvatiFavorite();
		} else if (window.location.href.includes("dokumentacija")) {
			DokumentacijaFunc();
		} else if (window.location.href.includes("dnevnik")) {
			DohvatiDnevnik();
		} else {
			SearchSeries();
		}

		addToNavBar();
		const logInOutButton = document.getElementById("logInOut");
		logInOutButton.addEventListener("click", async () => {
			await logInOut();
		});
	} catch {}
});
function checkIfAdmin(navBar) {
	let buttons = `
        <button id="registerButton"  class="btn btn-outline-primary" type="submit" onclick="redirectTo('registracija')">Registriraj novog korisnika</button>
        <button id="allUsers" class="btn btn-outline-primary" type="submit" onclick="redirectTo('korisnici')">Svi Korisnici</button>
        <button id="log" class="btn btn-outline-primary" type="submit" onclick="redirectTo('dnevnik')">Dnevnik</button>
    `;
	navBar.innerHTML += buttons;
}

function redirectTo(urle) {
	window.location.href = `http://${window.location.host}/${urle}`;
}

function DokumentacijaFunc() {
	let img = document.getElementById("era");
	img.addEventListener("click", () => {
		let imgSrc = img.getAttribute("src");
		window.open(`http://${window.location.host}${imgSrc}`, "_blank");
	});
}

async function DohvatiDnevnik() {
	let div = document.getElementById("list");
	let param = await dodajToken();
	let podaci = await fetch("/baza/dnevnik", param);
	let loadingMsg = document.getElementById("loading");
	for (var log of await podaci.json()) {
		console.log(log);
		div.innerHTML += `<div class="mb-3 border-1 border-black" >
			<p>Datume i vrijeme: ${log.DatumVrijeme}</p>
			<p>Vrsta zahtjeva: ${log.Vrsta_Zahtjeva}</p>
			<p>Trazeni resurs: ${log.Trazeni_Resurs}</p>
			<p>Tijelo: ${log.Tijelo}</p>
			<p>ID Korisnika: ${log.User_ID}</p>
		</div>`;
	}
	loadingMsg.innerHTML = "";
}

async function SviKorisnici() {
	if (currentRole != "Admin") return;
	let param = await dodajToken();
	let podaci = await fetch("/baza/korisnici", param);
	let divList = document.getElementById("listD");
	for (var item of JSON.parse(await podaci.text())) {
		divList.innerHTML += `<div class="horizontalDiv">
			<h3> Korisnik: ${item.Ime} ${item.Prezime}</h3>
			<p> Email: ${item.Email}</p>
			<p> Godina rođenja: ${item.Godina_rodenja}</p>
			<p> Spol: ${item.Spol}</p>
			<p> Drzava: ${item.Drzava}</p>
			<p> Username: ${item.Username}</p>
			<p> Uloga: ${
				item.Uloga_ID === 1
					? "Admin"
					: item.Uloga_ID === 2
					? "Običan korisnik "
					: "Gost"
			}</p>
			${
				item.ID_user === 1 || item.Uloga_ID === 3
					? ``
					: `<button class="btn btn-primary" onclick="DeleteUser('${item.Username}')">Izbriši</button>`
			}
			
		</div>`;
	}
}

async function DeleteUser(username) {
	console.log("DELET" + username);

	let parametri = await dodajToken();
	parametri.method = "DELETE";
	console.log(parametri);
	let odg = await fetch(`/baza/korisnici/${username}`, parametri);
	window.location.reload();
}

function Login() {
	let loginButton = document.getElementById("loginButton");
	loginButton.addEventListener("click", async (event) => {
		event.preventDefault();
		if (!(await prijaviKorisnika())) {
		}
	});
}

function Register() {
	console.log("Register");
	let registerButton = document.getElementById("registerUserButton");
	let div = document.getElementById("poruka");
	registerButton.addEventListener("click", async (event) => {
		event.preventDefault();
		let user = {
			Ime: undefined,
			Prezime: undefined,
			Email: undefined,
			Godina_rodenja: undefined,
			Spol: undefined,
			Drzava: undefined,
			Username: undefined,
			Password_Hash: undefined,
			Uloga_ID: undefined,
		};

		let form = document.forms["register"].getElementsByTagName("input");
		for (var item of form) {
			user[item.name] = item.value;
		}
		let spol = document.getElementById("registerGender");
		console.log(spol.value);
		user.Spol = spol.value;
		let select = document.getElementById("registerSelect");
		user.Uloga_ID = select.value;

		if (
			user.Email == "" ||
			!user.Email.includes("@") ||
			!user.Email.includes(".") ||
			user.Username == "" ||
			user.Password_Hash == ""
		) {
			div.innerHTML += `<p class="text-danger">Potrebno je ispuniti email, username i lozinku</p>`;
		} else {
			let parametri = await dodajTokenIParametre(user);

			let odgovor = await fetch(`/baza/korisnici`, parametri);

			if (odgovor.status == 201) {
				div.innerHTML += `<p class="text-success">Dodan korisnik</p>`;
			} else {
				div.innerHTML += `<p class="text-danger">Greška kod registracije</p>`;
			}
		}
	});
}

function SearchSeries() {
	let searchBox = document.getElementById("searchBox");
	searchBox.addEventListener("keyup", async () => {
		if (searchBox.value.length > 2) {
			console.log("Parametri");
			let parametri = await dodajToken();
			let odg = await fetch(
				window.location.href + "series?filter=" + searchBox.value,
				parametri
			);
			let divList = document.getElementById("list");
			divList.innerHTML = "";
			for (var item of JSON.parse(await odg.text()).results) {
				divList.innerHTML += `<div>
				<h3 class="">${item.name}</h3>
				<button class=" mb-3 btn btn-primary" onclick="openSeriesDetail(${item.id})">Detalji</button>
				<p class="d-block">Opis: ${item.overview}</p>
				
				</div>`;
			}
		}
	});
}

function openSeriesDetail(id) {
	window.location.href = `http://${window.location.host}/detalji/${id}`;
}

async function DohvatiDetaljiSerije() {
	const urlParts = window.location.href.split("/");
	const id = urlParts[urlParts.length - 1];

	let parametri = await dodajToken();

	if (window.location.href.includes("fromDB=true")) {
		await DetaljiBaza(id, parametri);
	} else {
		await DetaljiTMDB(id, parametri);
	}
}

async function DetaljiBaza(serijaID, param) {
	let data = await (await fetch(`/baza/favoriti/${serijaID}`, param)).json();
	let serija = data.podaci[0];
	let sezone = data.sezona;
	let div = document.getElementById("tvDetail");
	div.innerHTML += `
	<h2>${serija.Naziv}</h2>
	<image class="floatLeft maginInline5vh" src="https://image.tmdb.org/t/p/w500/${
		serija.Slika
	}" alt=Poster za seriju ${serija.Naziv}>
	<p>Opis: ${serija.Opis}</p>
	<p>Broj sezona: ${serija.Broj_epizoda}</p>
	<p>Broj epizoda: ${serija.Broj_epizoda}</p>
	<p>Popularnost: ${serija.Popularnost}</p>
	${
		serija.Homepage != ""
			? `<a href="${serija.Homepage}">Poveznica na vanjsku stranicu</a>`
			: `Trenutno nije dostupna vanjska poveznica`
	}
	`;
	let table = `
  <table class="table table-hover table-bordered">
    <thead class="text-center">
      <th scope="col">Naziv sezone</th>
      <th scope="col">Broj sezone</th>
      <th scope="col">Broj epizoda u sezoni</th>
      <th scope="col">Opis</th>
      <th scope="col">Slika</th>
    </thead>
    <tbody>
  `;
	for (var season of sezone) {
		table += `
      <tr>
        <td>${season.Naziv}</td>
        <td>${season.Broj_sezone}</td>
        <td>${season.Broj_epizoda_u_sezoni}</td>
        <td>${season.Opis}</td>
        <td><img class="floatLeft maginInline5vh" src="${season.Slika}" alt="Poster za seriju ${season.Naziv}"></td>
      </tr>
    `;
	}
	table += `</tbody>
  </table>`;
	div.innerHTML += table;
	console.log(data);
}

async function DetaljiTMDB(id, parametri) {
	let odg = await fetch(`/series/${id}`, parametri);
	let podaci = JSON.parse(await odg.text());
	console.log(podaci);
	let div = document.getElementById("tvDetail");
	div.innerHTML += `
	<h2>${podaci.name}</h2>
	<image class="floatLeft maginInline5vh" src="https://image.tmdb.org/t/p/w500/${
		podaci.poster_path
	}" alt=Poster za seriju ${podaci.name}>
	<p>Opis: ${podaci.overview}</p>
	<p>Broj sezona: ${podaci.number_of_seasons}</p>
	<p>Broj epizoda: ${podaci.number_of_episodes}</p>
	${
		podaci.homepage != ""
			? `<a href="${podaci.homepage}">Poveznica na vanjsku stranicu</a>`
			: `Trenutno nije dostupna vanjska poveznica`
	}`;
	if (currentRole != "Gost") {
		if (!(await provjeriUFavoritima(podaci.id))) {
			div.innerHTML += `<br><button class="btn btn-success mt-3" id="addToFavourite">Dodaj u favorite</button>`;
			addToFavourite(podaci);
		} else {
			div.innerHTML += `<br><button class="btn btn-danger mt-3" id="removeFromFavourite">Ukloni iz favorita</button>`;
			removeFromFavourite(podaci.id);
		}
	}
}

function addToFavourite(podaci) {
	let button = document.getElementById("addToFavourite");
	let serija = {
		TMDB_ID_serije: podaci.id,
		Naziv: podaci.name,
		Opis: podaci.overview,
		Slika: `https://image.tmdb.org/t/p/w500/${podaci.poster_path}`,
		Broj_sezona: podaci.number_of_seasons,
		Broj_epizoda: podaci.number_of_episodes,
		Popularnost: podaci.popularity,
		Homepage: podaci.homepage ?? "",
		Seasons: podaci.seasons,
	};

	button.addEventListener("click", async () => {
		let param = await dodajTokenIParametre(serija);
		param.method = "POST";
		let odg = await fetch("/baza/favoriti", param);
		console.log(odg.status);
		window.location.reload();
	});
}

async function provjeriUFavoritima(serijaID) {
	let param = await dodajToken();
	let odg = await fetch(`/baza/favoriti/${serijaID}`, param);
	console.log("U BAZI:");
	let odgovor = await odg.json();
	console.log(odgovor.podaci);
	return odgovor.podaci;
}

function removeFromFavourite(serijaID) {
	let button = document.getElementById("removeFromFavourite");
	button.addEventListener("click", async () => {
		await prepareToRemove(serijaID);
	});
}

async function prepareToRemove(serijaID) {
	let param = await dodajToken();
	param.method = "DELETE";
	let odg = await fetch(`/baza/favoriti/${serijaID}`, param);
	window.location.reload();
}

async function DohvatiFavorite() {
	let params = await dodajToken();
	let podaci = await fetch("/baza/favoriti", params);
	let div = document.getElementById("listFav");
	for (var item of JSON.parse(await podaci.text())) {
		div.innerHTML += `
		<div class="horizontalDiv" >
			<div onclick="detaljiFavorita(${item.TMDB_ID_serije})">
				<img class="floatLeft maginInline5vh" src="${item.Slika}">
				<h2>${item.Naziv} </h2>
				<p>Opis: ${item.Opis}</p>
				<p>Broj sezona:${item.Broj_sezona}</p>
				<p>Broj epizoda:${item.Broj_epizoda}</p>
				<p>Početna stranica: <a href="${item.Homepage}">${item.Homepage}</a></p>
				<p>Popularnost:${item.Popularnost} </p>
			</div>
				<button class="btn btn-outline-danger mt-3 d-block h-auto z-20" onclick="prepareToRemove(${item.TMDB_ID_serije})">Ukloni iz favorita</button>
			
		</div>`;
	}
}

async function detaljiFavorita(serijaID) {
	redirectTo(`detalji/${serijaID}?fromDB=true`);
}

async function DohvatiPodatkeKorisnika() {
	let params = await dodajToken();
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
}

async function prijaviKorisnika() {
	let username = document.getElementById("loginUsername").value;
	let password = document.getElementById("loginPassword").value;

	let tijelo = { korime: username, lozinka: password };

	let parametri = pripremiParametre(tijelo);
	let odgovor = await fetch(`/baza/korisnici/${username}/prijava`, parametri);

	console.log(odgovor.status);
	window.location.reload();
	return true;
}

function pripremiParametre(tijelo) {
	let zaglavlje = new Headers();

	zaglavlje.set("Content-Type", "application/json");

	let parametri = {
		method: "POST",
		body: JSON.stringify(tijelo),
		headers: zaglavlje,
	};

	return parametri;
}

async function dodajToken(parametri = {}) {
	let zaglavlje = new Headers();

	let token = await dajToken();

	zaglavlje.set("Authorization", token);
	parametri.headers = zaglavlje;

	return parametri;
}

async function dodajTokenIParametre(tijelo) {
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
}

async function dajToken() {
	return (await fetch(`/baza/korisnici/token/prijava`)).headers.get(
		"Authorization"
	);
}

async function getRole() {
	return await fetch(`/userrole`);
}

async function logInOut() {
	console.log("LOF");
	if (currentRole === "Gost") {
		window.location.href = "http://" + window.location.host + "/prijava";
	} else {
		console.log("Logging out...");
		await LoginAsGuest(true);
		window.location.reload();
	}
}

function isAdmin() {
	return currentRole === "Admin";
}

async function LoginAsGuest(logout) {
	if ((await getRole()).status === 400 || logout) {
		console.log("Prijavi kao guest");
		await prijaviKaoGuest();
	} else {
		return;
	}
}

async function prijaviKaoGuest() {
	let tijelo = { korime: "guest", lozinka: "rwa" };
	let parametri = await pripremiParametre(tijelo);
	console.log("Logging out as guest");
	let odgovor = await fetch(`/baza/korisnici/guest/prijava`, parametri);
	console.log(await odgovor.text());
	return true;
}

function addToNavBar() {
	console.log("ADD");
	let navBar = document.getElementsByClassName("navbar")[0];
	navBar.innerHTML += `  <button type="submit"  class="btn btn-outline-primary" id="btnHome" onClick="redirectTo('')">Pretraži filmove</button>`;
	navBar.innerHTML += `  <button type="submit"  class="btn btn-outline-primary" id="btnDoc" onClick="redirectTo('dokumentacija')">Dokumentacija</button>`;
	if (isAdmin()) {
		checkIfAdmin(navBar);
	}
	if (currentRole === "Gost") {
		navBar.innerHTML += `<button type="submit"  class="btn btn-outline-primary" id="logInOut">Prijava</button>`;
	} else {
		navBar.innerHTML += `<button type="submit"  class="btn btn-outline-primary" id="profile" onClick="redirectTo('profile')">Profil</button>`;
		navBar.innerHTML += `<button type="submit"  class="btn btn-outline-primary" id="favourite" onClick="redirectTo('favourites')">Favoriti</button>`;
		navBar.innerHTML += `<button type="submit"  class="btn btn-outline-danger" id="logInOut" class="floatEnd">Odjava</button>`;
	}
}
