import express from "express";
import Korisnik from "./Servis/KorisnikDAO.js";
import Serija from "./Servis/SerijaDAO.js";
import Konfiguracija from "./konfiguracija.js";
import TMDBklijent from "./Servis/TMDBKlijent.js";
import sesija from "express-session";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import jwt from "./Servis/jwt.js";
import email from "./Servis/mail.js";
import LogDAO from "./Servis/LogDAO.js";
//import portovi from "/var/www/RWA/2023/portovi.js";
const port = 12000;
//const port = portovi.tpapic21;
const server = express();

let konf = new Konfiguracija();
let korisnikDAO = new Korisnik();
let serijaDAO = new Serija();
let logDAO = new LogDAO();
let putanja = konf.dajPutanju();
let log = {
	Vrsta_Zahtjeva: undefined,
	Trazeni_Resurs: undefined,
	Tijelo: undefined,
	User_ID: undefined,
};

server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
/*server.use(
	"/cssFile",
	express.static(path.join(putanja, "/app/css/dizajn.css"))
);*/

server.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	next();
});

//server.use("/js", express.static(path.join(putanja, "/aplikacija/js")));
//server.use("/mediji", express.static(path.join(putanja, "/app/mediji")));

var tmdbKlijent;
server.use(cookieParser());

konf
	.pripremiKonfiguraciju()
	.then(() => {
		runServer();
	})
	.catch((e) => {
		console.log(e);
	});

function runServer() {
	console.log(konf.ValidateFile(konf.dajKonf()));
	if (konf.dajOpis().opis != "200") {
		console.log(konf.dajOpis());
		process.exit(1);
	}

	server.use(
		sesija({
			secret: konf.dajKonf().tajniKljucSesija,
			saveUninitialized: true,
			cookie: { maxAge: 1000 * 60 * 60 * 3 },
			resave: false,
			httpOnly: true,
		})
	);
	RESTfunctions();

	//pripremiStranice();

	tmdbKlijent = new TMDBklijent(konf.dajKonf().tmdbApiKeyV3);
	TMDBServis();

	server.use(
		"/",
		express.static(path.join(putanja, "./angular/dist/zadaca/browser"))
	);
	server.get("*", (zahtjev, odgovor) => {
		let pathf = path.join(putanja, "./angular/dist/zadaca/browser/index.html");
		odgovor.sendFile(pathf);
	});

	server.use((zahtjev, odgovor) => {
		odgovor.type("json");
		odgovor.status(404).send({ opis: "nema resursa" });
	});
	server.listen(port, () => {
		console.log(`Server pokrenut na portu: ${port}`);
	});
}

function RESTfunctions() {
	server.get("/userrole", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(zahtjev.session.jwt, konf);
		if (provjera) {
			odgovor.status(201).send(provjera.role);
		} else {
			odgovor.status(400).end();
		}
	});
	server.get("/baza/korisnici", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(
			zahtjev.headers.authorization.split(" ")[1],
			konf
		);
		if (isAdmin(provjera, odgovor)) {
			SetLog(zahtjev, "/baza/korisnici", provjera, "GET");
			await logDAO.dodajLog(log);
			odgovor.status(200).send(await korisnikDAO.GetAllUsers());
		} else {
			odgovor.redirect("/prijava");
		}
	});
	server.post("/baza/korisnici", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(
			zahtjev.headers.authorization.split(" ")[1],
			konf
		);
		if (isAdmin(provjera, odgovor)) {
			SetLog(zahtjev, "/baza/korisnici", provjera, "POST");
			await logDAO.dodajLog(log);
			var body = zahtjev.body;
			if (body.Username == "" || body.Password_Hash == "") {
				return;
			}
			let tijelo =
				"Vaše korisničko ime je " +
				body.Username +
				"\nVaša lozinka je " +
				body.Password_Hash;

			await korisnikDAO
				.AddNewUser(body)
				.then(async () => {
					email
						.posaljiMail(
							"tpapic21@student.foi.hr",
							body.Email,
							"Podaci za prijavu",
							tijelo
						)
						.then()
						.catch((error) => {
							console.log(error);
						});
					odgovor.status(201).end();
				})
				.catch((greska) => {
					console.log(greska);
					odgovor.status(401).end();
				});
		}
	});

	server.put("/baza/korisnici", async (zahtjev, odgovor) => {
		SetLog(zahtjev, "/baza/korisnici/", 7, "PUT");
		await logDAO.dodajLog(log);
		odgovor.status(501).json({ opis: "metoda nije implementirana" });
	});

	server.delete("/baza/korisnici", async (zahtjev, odgovor) => {
		SetLog(zahtjev, "/baza/korisnici/", 7, "DELETE");
		await logDAO.dodajLog(log);
		odgovor.status(501).json({ opis: "metoda nije implementirana" });
	});

	server.get("/baza/korisnici/:username", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(
			zahtjev.headers.authorization.split(" ")[1],
			konf
		);
		if (provjera) {
			SetLog(zahtjev, "/baza/korisnici/:username", provjera, "GET");
			await logDAO.dodajLog(log);
			const username = zahtjev.params.username;
			let userDB = "";
			if (username === "_getCurrent") {
				userDB = await korisnikDAO.GetUserWithUsername(provjera.username);
				console.log("CURRENT: ");
				console.log(userDB);
			} else {
				userDB = await korisnikDAO.GetUserWithUsername(username);
			}
			if (userDB != null) {
				odgovor.status(200).send(userDB);
			}
		} else {
			odgovor.status(401).json({ opis: "zabranjen pristup" });
		}
	});

	server.post("/baza/korisnici/:username", async (zahtjev, odgovor) => {
		odgovor.type("json");
		odgovor.status(405).json({ opis: "zabranjeno" });
	});

	server.put("/baza/korisnici/:username", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(
			zahtjev.headers.authorization.split(" ")[1],
			konf
		);

		if (provjera) {
			SetLog(zahtjev, "/baza/korisnici/:username", provjera, "PUT");
			await logDAO.dodajLog(log);
			let username = zahtjev.params.username;
			let user = zahtjev.body;

			let odg = await korisnikDAO.UpdateUser(username, user);
			odgovor.status(201).end();
		}
	});

	server.delete("/baza/korisnici/:username", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(
			zahtjev.headers.authorization.split(" ")[1],
			konf
		);
		if (isAdmin(provjera)) {
			SetLog(zahtjev, "/baza/korisnici/:username", provjera, "DELETE");
			await logDAO.dodajLog(log);
			let username = zahtjev.params.username;
			let korisnik = await korisnikDAO.GetUserWithUsername(username);

			if (korisnik.Uloga_ID === 1 || korisnik.Uloga_ID === 3) {
				odgovor.type("json");
				odgovor
					.status(403)
					.send({ opis: "ne možete izbrisat admina ili gosta" });
			}
			console.log("DELETE: " + username);
			let odg = await korisnikDAO.deleteUser(username);
			odgovor.status(201).end();
		}
	});

	server.get("/baza/korisnici/:username/prijava", async (zahtjev, odgovor) => {
		if (zahtjev.session.jwt) {
			SetLog(zahtjev, "/baza/korisnici/:username/prijava", 7, "GET");
			await logDAO.dodajLog(log);
			odgovor
				.status(201)
				.set("Authorization", `Bearer ${zahtjev.session.jwt}`)
				.end();
		} else {
			odgovor.status(401).json({ opis: "zabranjen pristup" });
		}
	});

	server.post("/baza/korisnici/:username/prijava", async (zahtjev, odgovor) => {
		const username = zahtjev.params.username;
		const lozinka = zahtjev.body.lozinka;

		let user = { username: username, password: lozinka, role: undefined };
		let userDB = await korisnikDAO.provjeriKorisnika(user);
		console.log(user.username, user.password);
		if (userDB != false) {
			zahtjev.session.jwt = false;
			user.role = userDB.Naziv;
			user.id = userDB.ID_user;
			console.log("DOHVAĆENO");
			console.log(userDB);
			const token = jwt.kreirajToken(user, konf);
			zahtjev.session.jwt = token;
			SetLog(zahtjev, "/baza/korisnici/:username/prijava", user.id, "POST");
			await logDAO.dodajLog(log);
			odgovor.status(201).json({ token: token });
		} else {
			odgovor.status(401).json({ opis: "neuspješna prijava" });
		}
	});

	server.put("/baza/korisnici/:username/prijava", async (zahtjev, odgovor) => {
		SetLog(zahtjev, "/baza/korisnici/:username/prijava", 7, "PUT");
		await logDAO.dodajLog(log);
		odgovor.status(501).json({ opis: "metoda nije implementirana" });
	});

	server.delete(
		"/baza/korisnici/:username/prijava",
		async (zahtjev, odgovor) => {
			SetLog(zahtjev, "/baza/korisnici/:username/prijava", 7, "DELETE");
			await logDAO.dodajLog(log);
			odgovor.status(501).json({ opis: "metoda nije implementirana" });
		}
	);

	server.get("/baza/favoriti", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(
			zahtjev.headers.authorization.split(" ")[1],
			konf
		);
		if (provjera) {
			SetLog(zahtjev, "/baza/favoriti", provjera, "GET");
			await logDAO.dodajLog(log);
			let podaci = await serijaDAO.GetAllFavouritesForUser(provjera.username);
			odgovor.type("json");
			odgovor.status(200).send(podaci);
		} else {
		}
	});

	server.post("/baza/favoriti", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(
			zahtjev.headers.authorization.split(" ")[1],
			konf
		);
		if (provjera) {
			SetLog(zahtjev, "/baza/favoriti", provjera, "POST");
			await logDAO.dodajLog(log);
			let serija = zahtjev.body;
			console.log(serija);
			let podaci = await serijaDAO.AddToFavourite(provjera.userID, serija);

			if (podaci) {
				odgovor.type("json");
				odgovor.status(200).end();
			} else {
				odgovor.status(401).send({ opis: "favorit je već u bazi" });
			}
		} else {
		}
	});
	server.put("/baza/favoriti", async (zahtjev, odgovor) => {
		SetLog(zahtjev, "/baza/favoriti", 7, "PUT");
		await logDAO.dodajLog(log);
		odgovor.status(501).json({ opis: "metoda nije implementirana" });
	});
	server.delete("/baza/favoriti", async (zahtjev, odgovor) => {
		SetLog(zahtjev, "/baza/favoriti", 7, "DELETE");
		await logDAO.dodajLog(log);
		odgovor.status(501).json({ opis: "metoda nije implementirana" });
	});

	server.get("/baza/favoriti/:id", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(
			zahtjev.headers.authorization.split(" ")[1],
			konf
		);
		if (provjera) {
			SetLog(zahtjev, "/baza/favoriti/:id", provjera, "GET");
			await logDAO.dodajLog(log);
			let serijaid = zahtjev.params.id;
			console.log("ID SERIJE"+serijaid);
			let podaci = await serijaDAO.postojiFavoritUBazi(
				provjera.userID,
				serijaid
			);
			let sezona = await serijaDAO.SezoneSerija(serijaid);
			let data = { podaci, sezona };
			odgovor.status(200).json(data);
		}
	});
	server.post("/baza/favoriti/:id", async (zahtjev, odgovor) => {
		SetLog(zahtjev, "/baza/favoriti/:id", 7, "POST");
		await logDAO.dodajLog(log);
		odgovor.status(405).json({ opis: "zabranjeno" });
	});

	server.put("/baza/favoriti/:id", async (zahtjev, odgovor) => {
		SetLog(zahtjev, "/baza/favoriti/:id", 7, "PUT");
		await logDAO.dodajLog(log);
		odgovor.status(405).json({ opis: "zabranjeno" });
	});

	server.delete("/baza/favoriti/:id", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(
			zahtjev.headers.authorization.split(" ")[1],
			konf
		);
		if (provjera) {
			SetLog(zahtjev, "/baza/favoriti/:id", provjera, "DELETE");
			await logDAO.dodajLog(log);
			let id = zahtjev.params.id;
			let podaci = await serijaDAO.ukloniIzFavorita(provjera.userID, id);
			odgovor.status(200).send(podaci);
		}
	});

	server.get("/baza/dnevnik", async (zahtjev, odgovor) => {
		let provjera = jwt.provjeriToken(
			zahtjev.headers.authorization.split(" ")[1],
			konf
		);
		if (isAdmin(provjera)) {
			SetLog(zahtjev, "/baza/dnevnik", provjera, "GET");
			await logDAO.dodajLog(log);
			let data = await logDAO.dajLog();
			odgovor.status(200).json(data);
		}
	});
	server.post("/baza/dnevnik", async (zahtjev, odgovor) => {
		SetLog(zahtjev, "/baza/dnevnik", 7, "POST");
		await logDAO.dodajLog(log);
		odgovor.status(501).json({ opis: "metoda nije implementirana" });
	});
	server.put("/baza/dnevnik", async (zahtjev, odgovor) => {
		SetLog(zahtjev, "/baza/dnevnik", 7, "PUT");
		await logDAO.dodajLog(log);
		odgovor.status(501).json({ opis: "metoda nije implementirana" });
	});
	server.delete("/baza/dnevnik", async (zahtjev, odgovor) => {
		SetLog(zahtjev, "/baza/dnevnik", 7, "DELETE");
		await logDAO.dodajLog(log);
		odgovor.status(501).json({ opis: "metoda nije implementirana" });
	});
}

function SetLog(zahtjev, trazeniResurs, provjera, vrstaZahtjev) {
	log.Tijelo = zahtjev.body;
	log.Trazeni_Resurs = trazeniResurs;
	log.User_ID = provjera.userID === undefined ? provjera : provjera.userID;
	log.Vrsta_Zahtjeva = vrstaZahtjev;
}

function isAdmin(provjera, odgovor) {
	if (provjera) {
		if (provjera.role === "Admin") {
			return true;
		} else {
			odgovor.type("json");
			odgovor.status(403).json({ opis: "zabranjen pristup" });
		}
	} else {
		odgovor.type("json");
		odgovor.status(401).json({ opis: "potrebna prijava" });
	}
}

/*function pripremiStranice() {
	server.get("/dokumentacija", (zahtjev, odgovor) => {
		if (zahtjev.session.jwt) {
			odgovor.sendFile(putanja + "/app/dokumentacija/dokumentacija.html");
			console.log("sending dokumentacija.html");
		} else {
			odgovor.redirect("/prijava");
		}
	});

	server.get("/korisnici", (zahtjev, odgovor) => {
		if (zahtjev.session.jwt) {
			odgovor.sendFile(putanja + "/app/svikorisnici.html");
			console.log("sending dokumentacija.html");
		} else {
			odgovor.redirect("/prijava");
		}
	});

	server.get("/prijava", (zahtjev, odgovor) => {
		if (zahtjev.session.jwt) {
			let provjera = jwt.provjeriToken(zahtjev.session.jwt, konf);

			if (provjera.role === "Gost") {
				console.log("sending prijava.html");
				odgovor.sendFile(putanja + "/app/prijava.html");
			} else {
				odgovor.redirect("/");
			}
		} else {
		}
	});

	server.get("/detalji/:id", (zahtjev, odgovor) => {
		if (zahtjev.session.jwt) {
			console.log("sending prijava.html");
			odgovor.sendFile(putanja + "/app/detaljiSerije.html");
		} else {
			odgovor.redirect("/");
		}
	});
	server.get("/registracija", (zahtjev, odgovor) => {
		if (zahtjev.session.jwt) {
			if (jwt.provjeriToken(zahtjev.session.jwt, konf).role == "Admin") {
				console.log("sending registracija.html");
				odgovor.sendFile(putanja + "/app/registracija.html");
			} else {
				odgovor.status(403).json({ opis: "zabranjen pristup" });
			}
		} else {
			odgovor.status(401).json({ opis: "potrebna prijava" });
		}
	});
	server.get("/dnevnik", (zahtjev, odgovor) => {
		if (zahtjev.session.jwt) {
			if (jwt.provjeriToken(zahtjev.session.jwt, konf).role == "Admin") {
				console.log("sending dnevnik.html");
				odgovor.sendFile(putanja + "/app/dnevnik.html");
			} else {
				odgovor.status(403).json({ opis: "zabranjen pristup" });
			}
		} else {
			odgovor.status(401).json({ opis: "potrebna prijava" });
		}
	});
	server.get("/profile", (zahtjev, odgovor) => {
		if (zahtjev.session.jwt) {
			if (jwt.provjeriToken(zahtjev.session.jwt, konf).role != "Gost") {
				console.log("sending profil.html");
				odgovor.sendFile(putanja + "/app/profil.html");
			} else {
				odgovor.status(403).json({ opis: "zabranjen pristup" });
			}
		} else {
			odgovor.status(401).json({ opis: "potrebna prijava" });
		}
	});

	server.get("/favourites", (zahtjev, odgovor) => {
		if (zahtjev.session.jwt) {
			if (jwt.provjeriToken(zahtjev.session.jwt, konf).role != "Gost") {
				console.log("sending favoriti.html");
				odgovor.sendFile(putanja + "/app/favoriti.html");
			} else {
				odgovor.status(403).json({ opis: "zabranjen pristup" });
			}
		} else {
			odgovor.status(401).json({ opis: "potrebna prijava" });
		}
	});
}*/
function TMDBServis() {
	server.get("/series", async (zahtjev, odgovor) => {
		let token = zahtjev.headers.authorization.split(" ")[1];
		let provjera = jwt.provjeriToken(token, konf);
		if (!provjera) {
			odgovor.status(401).end();
			return;
		}

		let filter = zahtjev.query.filter;

		let podaci = await tmdbKlijent.dohvatiSerije(filter);
		odgovor.type("json");
		odgovor.send(JSON.parse(podaci));
	});

	server.get("/series/:id", async (zahtjev, odgovor) => {
		let token = zahtjev.headers.authorization;
		if (!token) {
			odgovor.status(401).json({ opis: "potrebna prijava" }).end();
			return;
		}
		token = token.split(" ")[1];
		let provjera = jwt.provjeriToken(token, konf);
		if (provjera) {
			console.log("Provjeren token: ");
			console.log(provjera);
			let id = zahtjev.params.id;
			let podaci = await tmdbKlijent.dohvatiSerijuPoId(id);
			odgovor.type("json");
			odgovor.send(JSON.parse(podaci));
		}
	});
}
