////////////// Server wird über Terminal gestartet, ist im Backend: node server_clean.js

// Module von Node importieren
import * as Http from "http"; // Importiert alles * aus "http" und kann über Objekt Http darauf zugegriffen werden.
import * as Url from "url"; // Um url, die mit _request reinkam, weiter zu verarbeiten.
import * as Mongo from "mongodb"

// Startet den Server, wenn Skript ausgeführt wird.
let server: Http.Server = Http.createServer();
// Setzt Portnummer - über dieses Port findet dann die Kommunikation zwischen Server und Client statt.
let port: number = 5002; // Achtung, kann sein, das kommt, Portnummer schon in Verwendung, dann einfach andere Portnummer verwenden.
// Öffnet Port und hört / schaut, ob Nachrichten über Port hereinkommen.
server.listen(port)
// Fügt Event-Listener zum "horchenden", auf Daten wartenden Server hinzu.
    // Wenn ein "request" (eine Anfrage) eingeht, z.B. Daten erhalten werden, dann wird macheDasWennKommunikationVomClientKommt-Funktion ausgeführt.
server.addListener("request", macheDasWennKommunikationVomClientKommt);
    // Funktion die ausgeführt wird, wenn Event, "request" geht ein, eintritt.
    // Also macheDasWennKommunikationVomClientKommt-Funktion wird ausgeführt, wenn http://localhost:Hier-Portnummer-einsetzen/ im Browser aufgerufen wird:
    // also wenn http://localhost:5002/ aufgerufen wird.
    // Der gesamte Inhalt des request (der Anfrage), steckt dann im _request Objekt.
function macheDasWennKommunikationVomClientKommt(_request: HTMLOutputElement.IncomingMessage, _response: HTMLOutputElement.ServerResponse): void {
    // Definiert, dass bei request (Anfrage) an Server Text weggeschickt wird - an Client.
    _response.setHeader("content-type", "text/html; charset=utf-8");
    // Definiert, dass Antwort überall hingeschickt werden darf.
    _response.setHeader("Access-Control-Allow-Origin", "*")
    
    // Greift auf url in _request zu, wenn es _request.url gibt, dann true und geht in if-Rumpf.
    if (_request.url) {
        // Nachricht vom Client auswerten.
        let url: Url.UrlWithParsedQuery = Url.parse(_request.url, true); // Parst _request.url = macht Inhalt in _request.url besser lesbar.
        console.log("Client hat folgenden Text gesendet:")
        console.log(url.query);
        // Kann auch über Nachricht vom Client, key-Werte-Paare, iterieren.
        let loeschen: boolean = false;
        let hinzufügen: boolean = true;
        for (let key in url.query) {
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
        let nachrichtVomClientAlsJSONString: string = JSON.stringify(url.query) // Wandelt Nachricht vom Client in JSON-String um.
        // Packt Nachricht vom Client in mongodb.
        mongodb(nachrichtVomClientAlsJSONString, loeschen, _response, hinzufügen)
    }
}



// mongodb Teil.
// https://cloud.mongodb.com/
// Nuzter: eia2_user
// Passwort: eia2_password15
// DB-Name: eia2_db
// Collection-Name: eia2_collection
function mongodb(nachrichtVomClientAlsJSONString: String, loeschen: boolean, _response: HTMLOutputElement.ServerResponse, hinzufügen: boolean) {
    // Setzt Informationen, die notwendig sind, um eine Verbindung mit der mongodb aufzubauen.
    let MongoClient = require("mongodb").MongoClient;
    let password: string = "eia2_password15";
    let dbname: string = "eia2_db";
    let collection_name: string = "eia2_collection";
    let uri = `mongodb+srv://eia2_user:${password}@cluster0.kpcgc.mongodb.net/${dbname}?retryWrites=true&w=majority`;
    let client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {  // Baut Verbindung auf oder wirft Fehler, wenn Verbindung nicht aufgebaut werden kann.
        let collection = client.db(dbname).collection(collection_name);
        // Mit collection-Objekt können mongodb-Befehle verwendet werden: dazu collection.HierBefehlSchreiben(...).
        if (loeschen) {
              // Löscht Wert in der DB.
            collection.drop() // Löscht gesamte Collection in DB, und da alle Raketeneinstellungen in dieser Collection sind, auch alle Raketeneinstellungen.
            client.db(dbname).createCollection(collection_name) // Erstellt leere Collection.
        } else if (hinzufügen) {
              // Fügt Objekt in DB ein.
            collection.insertOne(JSON.parse(nachrichtVomClientAlsJSONString)); // Konvertiert JSON-String zu JSON-Objekt und gibt Objekt in mongodb.
            // Holt sich alle Einträge aus der DB und packt diese in einen Array gefundenInDBArray.
        }

        collection.find({}).toArray(function(err, gefundenInDBArray) { //
          if (err) throw err;
          //console.log(gefundenInDBArray); // Das gibt den gesamten Array auf einmal auf der Konsole aus.
          gefundenInDBArray.forEach(function(elementInDBArray){ // Das iteriert über jedes Element/Objekt im Array und greift auf Werte zu.
              console.log(elementInDBArray._id, elementInDBArray.farbe, elementInDBArray.explosionskraft, elementInDBArray.funkengroesse, elementInDBArray.funkenanzahl);
              
           });
            // Antwort an Server schicken. Schickt gesamte Inhalt der mongodb.
            _response.write(JSON.stringify(gefundenInDBArray)) // Konvertiert gefundenInDBArray, der DB Einträge enthält, in JSON-String; und sendet JSON-String an Client. 
            _response.end();

        });

              // Schließt Verbindung zur Datenbank.
        client.close();
      }); 
}