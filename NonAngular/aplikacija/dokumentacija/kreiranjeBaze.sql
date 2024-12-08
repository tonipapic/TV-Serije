BEGIN;
CREATE TABLE "Serija"(
  "TMDB_ID_serije" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "Naziv" VARCHAR(50) NOT NULL,
  "Opis" TEXT,
  "Slika" VARCHAR(500),
  "Broj_sezona" INTEGER NOT NULL,
  "Broj_epizoda" INTEGER NOT NULL,
  "Popularnost" INTEGER NOT NULL,
  "Homepage" VARCHAR(45) NOT NULL
);
CREATE TABLE "Uloga"(
  "ID_uloge" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "Naziv" VARCHAR(45) NOT NULL,
  "Opis" TEXT
);
CREATE TABLE "SezonaSerije"(
  "TMDB_ID_sezone" INTEGER PRIMARY KEY NOT NULL,
  "Naziv" VARCHAR(75) NOT NULL,
  "Opis" TEXT,
  "Slika" VARCHAR(500),
  "Broj_sezone" INTEGER NOT NULL,
  "Broj_epizoda_u_sezoni" INTEGER NOT NULL,
  "TMDB_ID_serije" INTEGER NOT NULL,
  CONSTRAINT "fk_SezonaSerije_Serija1"
    FOREIGN KEY("TMDB_ID_serije")
    REFERENCES "Serija"("TMDB_ID_serije")
);
CREATE INDEX "SezonaSerije.fk_SezonaSerije_Serija1_idx" ON "SezonaSerije" ("TMDB_ID_serije");
CREATE TABLE "Korisnik"(
  "ID_user" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "Ime" VARCHAR(50),
  "Prezime" VARCHAR(75),
  "Email" VARCHAR(100) NOT NULL,
  "Godina_rodenja" INTEGER,
  "Spol" VARCHAR(10),
  "Drzava" VARCHAR(50),
  "Username" VARCHAR(45) NOT NULL,
  "Password_Hash" VARCHAR(500) NOT NULL,
  "Salt" VARCHAR(500) NOT NULL,
  "Uloga_ID" INTEGER NOT NULL,
  CONSTRAINT "fk_User_Uloga1"
    FOREIGN KEY("Uloga_ID")
    REFERENCES "Uloga"("ID_uloge")
);
CREATE INDEX "Korisnik.fk_User_Uloga1_idx" ON "Korisnik" ("Uloga_ID");
CREATE TABLE "Favorit"(
  "ID" INTEGER PRIMARY KEY NOT NULL,
  "ID_user" INTEGER NOT NULL,
  "TMDB_ID_serije" INTEGER NOT NULL,
  CONSTRAINT "fk_User_has_Serija_User1"
    FOREIGN KEY("ID_user")
    REFERENCES "Korisnik"("ID_user"),
  CONSTRAINT "fk_User_has_Serija_Serija1"
    FOREIGN KEY("TMDB_ID_serije")
    REFERENCES "Serija"("TMDB_ID_serije")
);
CREATE INDEX "Favorit.fk_User_has_Serija_Serija1_idx" ON "Favorit" ("TMDB_ID_serije");
CREATE INDEX "Favorit.fk_User_has_Serija_User1_idx" ON "Favorit" ("ID_user");
CREATE TABLE "Dnevnik"(
  "ID_log" INTEGER PRIMARY KEY NOT NULL,
  "Datum" DATE NOT NULL,
  "Vrijeme" TIME NOT NULL,
  "Vrsta_Zahtjeva" VARCHAR(45) NOT NULL,
  "Trazeni_Resurs" VARCHAR(45) NOT NULL,
  "Tijelo" TEXT DEFAULT NULL,
  "User_ID" INTEGER NOT NULL,
  CONSTRAINT "fk_Log_User1"
    FOREIGN KEY("User_ID")
    REFERENCES "Korisnik"("ID_user")
);
CREATE INDEX "Dnevnik.fk_Log_User1_idx" ON "Dnevnik" ("User_ID");
COMMIT;
alter table Dnevnik Add DatumVrijeme DATETIME;