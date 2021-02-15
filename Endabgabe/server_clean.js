"use strict";
////////////// Server wird über Terminal gestartet, ist im Backend: node server_clean.js
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Module von Node importieren
var Http = __importStar(require("http")); // Importiert alles * aus "http" und kann über Objekt Http darauf zugegriffen werden.
var Url = __importStar(require("url")); // Um url, die mit _request reinkam, weiter zu verarbeiten.
// Startet den Server, wenn Skript ausgeführt wird.
var server = Http.createServer();
// Setzt Portnummer - über dieses Port findet dann die Kommunikation zwischen Server und Client statt.
var port = 5002; // Achtung, kann sein, das kommt, Portnummer schon in Verwendung, dann einfach andere Portnummer verwenden.
// Öffnet Port und hört / schaut, ob Nachrichten über Port hereinkommen.
server.listen(port);
// Fügt Event-Listener zum "horchenden", auf Daten wartenden Server hinzu.
// Wenn ein "request" (eine Anfrage) eingeht, z.B. Daten erhalten werden, dann wird macheDasWennKommunikationVomClientKommt-Funktion ausgeführt.
server.addListener("request", macheDasWennKommunikationVomClientKommt);
// Funktion die ausgeführt wird, wenn Event, "request" geht ein, eintritt.
// Also macheDasWennKommunikationVomClientKommt-Funktion wird ausgeführt, wenn http://localhost:Hier-Portnummer-einsetzen/ im Browser aufgerufen wird:
// also wenn http://localhost:5002/ aufgerufen wird.
// Der gesamte Inhalt des request (der Anfrage), steckt dann im _request Objekt.
function macheDasWennKommunikationVomClientKommt(_request, _response) {
    // Definiert, dass bei request (Anfrage) an Server Text weggeschickt wird - an Client.
    _response.setHeader("content-type", "text/html; charset=utf-8");
    // Definiert, dass Antwort überall hingeschickt werden darf.
    _response.setHeader("Access-Control-Allow-Origin", "*");
    // Greift auf url in _request zu, wenn es _request.url gibt, dann true und geht in if-Rumpf.
    if (_request.url) {
        // Nachricht vom Client auswerten.
        var url = Url.parse(_request.url, true); // Parst _request.url = macht Inhalt in _request.url besser lesbar.
        console.log("Client hat folgenden Text gesendet:");
        console.log(url.query);
        // Kann auch über Nachricht vom Client, key-Werte-Paare, iterieren.
        var loeschen = false;
        var hinzufügen = true;
        for (var key in url.query) {
            console.log(key + " " + url.query[key]); // Wird in Konsole ausgegeben.
            if (key == "loeschen") { // Prüft, ob in Nachricht von Client loeschen vorkommt, wenn ja, dann werden nachfolgend im Code alle DB-Einträge gelöscht.
                loeschen = true;
            }
            if (key == "nicht hinzufügen") { // Prüft, ob Nachricht zur DB hinzugefügt werden soll.
                hinzufügen = false;
            }
            // Wird auf Webseite ausgegeben = ist die Antwort = Response vom Servers.
        }
        // Wandelt Nachricht vom Client in JSON-String um.
        var nachrichtVomClientAlsJSONString = JSON.stringify(url.query); // Wandelt Nachricht vom Client in JSON-String um.
        // Packt Nachricht vom Client in mongodb.
        mongodb(nachrichtVomClientAlsJSONString, loeschen, _response, hinzufügen);
    }
}
// mongodb Teil.
// https://cloud.mongodb.com/
// Nuzter: eia2_user
// Passwort: eia2_password15
// DB-Name: eia2_db
// Collection-Name: eia2_collection
function mongodb(nachrichtVomClientAlsJSONString, loeschen, _response, hinzufügen) {
    // Setzt Informationen, die notwendig sind, um eine Verbindung mit der mongodb aufzubauen.
    var MongoClient = require("mongodb").MongoClient;
    var password = "eia2_password15";
    var dbname = "eia2_db";
    var collection_name = "eia2_collection";
    var uri = "mongodb+srv://eia2_user:" + password + "@cluster0.kpcgc.mongodb.net/" + dbname + "?retryWrites=true&w=majority";
    var client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(function (err) {
        var collection = client.db(dbname).collection(collection_name);
        // Mit collection-Objekt können mongodb-Befehle verwendet werden: dazu collection.HierBefehlSchreiben(...).
        if (loeschen) {
            // Löscht Wert in der DB.
            collection.drop(); // Löscht gesamte Collection in DB, und da alle Raketeneinstellungen in dieser Collection sind, auch alle Raketeneinstellungen.
            client.db(dbname).createCollection(collection_name); // Erstellt leere Collection.
        }
        else if (hinzufügen) {
            // Fügt Objekt in DB ein.
            collection.insertOne(JSON.parse(nachrichtVomClientAlsJSONString)); // Konvertiert JSON-String zu JSON-Objekt und gibt Objekt in mongodb.
            // Holt sich alle Einträge aus der DB und packt diese in einen Array gefundenInDBArray.
        }
        collection.find({}).toArray(function (err, gefundenInDBArray) {
            if (err)
                throw err;
            //console.log(gefundenInDBArray); // Das gibt den gesamten Array auf einmal auf der Konsole aus.
            gefundenInDBArray.forEach(function (elementInDBArray) {
                console.log(elementInDBArray._id, elementInDBArray.farbe, elementInDBArray.explosionskraft, elementInDBArray.funkengroesse, elementInDBArray.funkenanzahl);
            });
            // Antwort an Server schicken. Schickt gesamte Inhalt der mongodb.
            _response.write(JSON.stringify(gefundenInDBArray)); // Konvertiert gefundenInDBArray, der DB Einträge enthält, in JSON-String; und sendet JSON-String an Client. 
            _response.end();
        });
        // Schließt Verbindung zur Datenbank.
        client.close();
    });
}
