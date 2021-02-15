// Durchsucht gesamte HTML-Dokument und sucht nach
// <canvas></canvas>; wenn gefunden, dann wird canvas-Variable
// der Wert: <canvas></canvas>
// zugewiesen. Oder falls im HTML-Dokument <canvas>abc</canvas>
// steht, dann wird <canvas>abc</canvas> zugewiesen.
let canvas: HTMLCanvasElement = document.querySelector("canvas")

// Ändert den HTML-Code der canvas-Variable.
canvas.width = innerWidth // canvas bekommt Weite des Browser-Fensters.
canvas.height = 400 // canvas bekommt Höhe von 400 Pixel.

// Erstellt ein Objekt crc2, das es ermöglicht, auf Methoden zuzugreifen,
// mit denen u.a. auf canvas in 2D gezeichnet werden kann.
let crc2: CanvasRenderingContext2D = canvas.getContext("2d")

// Definiert Objekt auswahlNutzer und setzt initiale Werte.
// Durch auswahlNutzer. kann auf Werte zugegriffen werden, z.B auswahlNutzer.farbe ist inital "Zufall",
// auswahlNutzer.explosionskraft ist 4 usw.
// Das Objekt auswahlNutzer wird weiter unten im Code dazu verwendet,
// die Nutzereingaben (Raketen-Einstellung) vom Event-Listener zu erhalten.
let auswahlNutzer = {
    ausDBLaden: false,
    farbe: "Zufall",
    explosionskraft: 4,
    funkengroesse: 2,
    funkenanzahl: 200
}

// Definiert Rückgabe des Servers = Werte in mongodb.
let werteInDB: string = "";

// Definiert Objekt koordinatenDesMauszeigers und setzt initiale Werte.
// Das Objekt koordinatenDesMauszeigers wird weiter unten im Code dazu verwendet,
// die Mauskoordinaten vom Event-Listener zu erhalten - also wo in den Browser hat der Nutzer geklickt.
let koordinatenDesMauszeigers = {
    x: 0,
    y: 0
}


// Variable schwerkraft wird weiter unten im Code dazu verwendet, dass die Funken der Rakete immer schneller nach unten fallen.
let schwerkraft: number = 0.01

// Definiert einen leeren partikelArray; ein Array, in den alle Partikel-Objekte gepackt werden.
let partikelArray: Partikel[] = []

// Definiert die Partikel-Klasse; Partikel-Klasse ist sozusagen eine Vorlage für jedes Partikel-Objekt, das unten im Code erstellt wird. Partikel-Klasse definiert, wie jeder Kreis, der auf den Canvas gezeichnet wird, aussieht.
class Partikel {
    constructor(x: number, y: number, radius: number, farbe: string, geschwindigkeit: number) {
        this.x = x // x-Wert Zentrum-Kreis.
        this.y = y // y-Wert Zentrum-Kreis.
        this.radius = radius // Radius Kreis.
        this.farbe = farbe // Farbe Kreis.
        this.geschwindigkeit = geschwindigkeit // Geschwindigkeit Keis; damit Partikel sich vom Mausklick wegbewegen.
    }

    zeichneKreis() {
        // Zeichnet Kreis.
        // Bogen = Teil eines Kreises, oder Kreis.
        // (x-Zentrum-Kreis, y-Zentrum-Kreis, Radius, Start-Winkel im Bogenmaß (Radiant), End-Winkel im Bogenmaß, zeichne Rand des Kreises im Uhrzeigersinn = true oder entgegengesetzt = false).
        // Bogenmaß von 2 * Pi gibt Gradmaß von 360 Grad = ganzer Kreis.
        crc2.beginPath()
        crc2.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true)
        crc2.fillStyle = this.farbe
        crc2.fill()
        crc2.closePath()
    }
    
    update() {
        // Updatet Koordinaten des Kreises, und ruft zeichneKreis() auf.
        this.zeichneKreis()
        this.geschwindigkeit.y += schwerkraft // Addiert schwerkraft mit jedem Aufruf der update()-Funktion zu this.geschwindigkeit.y, damit bewegen sich die Paritkel in die y-Achse immer schneller = also fallen immer schneller nach unten, was grob Schwerkraft simuliert.
        this.x += this.geschwindigkeit.x // Berechnet neue x-Position Zentrum-Kreis, und damit die neue x-Positon des Kreises. this.x += this.geschwindigkeit.x bedeutet dasselbe wie this.x = this.x + this.geschwindigkeit.x 
        this.y += this.geschwindigkeit.y // Berechnet neue y-Position Zentrum-Kreis, und damit die neue y-Positon des Kreises.
    }
}

// Definiert Event-Listern.
// Event-Listener wird jedes Mal ausgeführt, wenn der Wert eines Dropdown-Menü-Elements geändert wird -
// also wenn der Nutzer die Eigenschaft der Rakete ändert.
window.addEventListener("load", dieseFunktionWirdAusgefuehrtWennDasEventEintritt);
function dieseFunktionWirdAusgefuehrtWennDasEventEintritt(event: any): void {
    let form = document.querySelector("div#form_id"); // Setzt Event-Listener für Dropdown-Menü in div#form_id.
    form.addEventListener("change", macheDasWennDropdownMenuWertSichAendert);
}
function macheDasWennDropdownMenuWertSichAendert(event: any): void {
    // document.getElementById("farbe_id").value holt sich den Wert zur id, hier z.B.: { "farb_name":"Heliotrop", "farb_code":"#D852FA"}
    // und .farb_code greift auf den Wert zu farb_code zu: hier z.B. #D852FA. Dieser Wert wird dann in das Objekt auswahlNutzer gegeben.
    auswahlNutzer.ausDBLaden = JSON.parse(document.getElementById("ausdbladen_id").value).aus_db;
    auswahlNutzer.farbe = JSON.parse(document.getElementById("farbe_id").value).farb_code;
    auswahlNutzer.explosionskraft = JSON.parse(document.getElementById("explosionskraft_id").value).ex_kraft;
    auswahlNutzer.funkengroesse = JSON.parse(document.getElementById("funkengroesse_id").value).funk_groesse;
    auswahlNutzer.funkenanzahl = JSON.parse(document.getElementById("funkenanzahl_id").value).funk_anzahl;

    // Hier wird die Nutzereingabe zusammengebaut und im Browser unter dem Canvas ausgegeben.
    let handle_zu_div_order_id_um_in_innerhtml_zu_schreiben: HTMLElement = <HTMLElement>document.querySelector("div#auswahl_id");
    if(handle_zu_div_order_id_um_in_innerhtml_zu_schreiben !== null) {
        handle_zu_div_order_id_um_in_innerhtml_zu_schreiben.innerHTML = "";
        handle_zu_div_order_id_um_in_innerhtml_zu_schreiben.innerHTML += "Farbe: " + JSON.parse(document.getElementById("farbe_id").value).farb_name + "<br />";
        handle_zu_div_order_id_um_in_innerhtml_zu_schreiben.innerHTML += "Explosionskraft: " + auswahlNutzer.explosionskraft + "<br />";
        handle_zu_div_order_id_um_in_innerhtml_zu_schreiben.innerHTML += "Funkengröße: " + auswahlNutzer.funkengroesse + "<br />";
        handle_zu_div_order_id_um_in_innerhtml_zu_schreiben.innerHTML += "Funkenanzahl: " + auswahlNutzer.funkenanzahl;
    }
}

// Definiert Event-Listener, der bei jedem Mausklick die Koordinaten der Maus und die Nutzer-Raketen-Einstellung verwendet,
// um Partikel-Objekte mit dieser Nutzer-Raketen-Einstellung zu erstellen. Alle erstellten Objekte werden in den partikelArray gegeben.
window.addEventListener("click", (event) => {
    koordinatenDesMauszeigers.x = event.clientX // x-Wert Mausklick.
    koordinatenDesMauszeigers.y = event.clientY // y-Wert Mausklick.

    // Setzt den Farbwert für die Variable farbe - abhängig davon, welchen Wert der Nutzer ausgewählt hat.
    let farbe: string = ""; 
    if (auswahlNutzer.farbe == "#D852FA") {
        farbe = "#D852FA"
    } else if (auswahlNutzer.farbe == "#6E7DE6") {
        farbe = "#6E7DE6"
    } else if (auswahlNutzer.farbe == "#5AFAF7") {
        farbe = "#5AFAF7"
    } else if (auswahlNutzer.farbe == "#65E668") {
        farbe = "#65E668"
    } else if (auswahlNutzer.farbe == "#FFFB9E") {
        farbe = "#FFFB9E"
    } else {
        farbe = `hsl(${Math.random() * 260}, 50%, 50%)`; // `und ${...} muss geschrieben werden, damit in den String das Ergebnis aus Math.random() * 260 eingefügt werden kann; das berechnet zufällig einen Farbwert.
    }

    // Um das ringförmige nach außen Bewegen der Partikel zu erreichen, wurden folgende Formeln verwendet:
    let winkelAendern: number = Math.PI * 2 / auswahlNutzer.funkenanzahl // Ganzer Kreis ist Pi * 2 im Bogenmaß,
        // und, siehe unten partikelArray.push(new Partikel ..., für x und y im Objekt {x: ..., y: ...} Math.cos(winkelAendern * i_te Iteration der for-Schleife) und Math.sin(...).
        // Und * Math.random(), damit sich Partikel nicht als perfekter Kreis nach außen bewegen, sondern zufällig, wie bei der Explosion einer Rakete.

    // Jedes Mal, wenn auf Canvas geklickt wird, sollen auswahlNutzer.funkenanzahl Partikel erstellt werden.
    if (koordinatenDesMauszeigers.y < canvas.height && koordinatenDesMauszeigers.y != 0){ // Soll aber nur passieren, wenn nicht unterhalb des Canvas geklickt wird. Und wenn tatsächlich auf Canvas geklickt wird.
        if (auswahlNutzer.ausDBLaden && werteInDB != "") {
            let obj = JSON.parse(werteInDB)[0] // Nimmt erste Element in DB.
            for (let i: number = 0; i < auswahlNutzer.funkenanzahl; i++) { 
                partikelArray.push(new Partikel(koordinatenDesMauszeigers.x, koordinatenDesMauszeigers.y, obj.funkengroesse, obj.farbe, {x: Math.cos(winkelAendern * i) * Math.random() * obj.explosionskraft, y: Math.sin(winkelAendern * i) * Math.random() * obj.explosionskraft}))
            }
        } else {
            for (let i: number = 0; i < auswahlNutzer.funkenanzahl; i++) { 
                partikelArray.push(new Partikel(koordinatenDesMauszeigers.x, koordinatenDesMauszeigers.y, auswahlNutzer.funkengroesse, farbe, {x: Math.cos(winkelAendern * i) * Math.random() * auswahlNutzer.explosionskraft, y: Math.sin(winkelAendern * i) * Math.random() * auswahlNutzer.explosionskraft}))
            }
        } 
    }
})



// Definiert animierePartikel-Funktion.
function animierePartikel() {
    // Ruft Funktion in requestAnimationFrame(...) immer und immer wieder auf, wie eine for-Schleife.
    // Da hier die animierePartikel-Funktion in rAF() gegeben wird, wird von rAF() animierePartikel() aufgerufen,
    // was in animierePartikel() rAF() aufruft, und rAF() ruft animierePartikel() auf usw.
    requestAnimationFrame(animierePartikel)
    // Überzeichnet alles im Bereich (0, 0) bis (Weite canvas, Höhe Canvas) mit schwarzer Farbe:
    crc2.fillStyle = "rgba(0, 0, 0, 0.05)" // und Alpha von 0.05 macht schwarzen Hintergrund fast durchsichtig.
    crc2.fillRect(0, 0, canvas.width, canvas.height) // Füllt Canvas mit gesetzter Farbe: schwarz.

    // Rufe für jedes Partikel-Objekt in Array partikelArray die Funktion update() in Partikel auf: dadurch werden die Partikel (Kreise) animiert.
    partikelArray.forEach((particle) => {
        particle.update()
    })
}

animierePartikel() // Ruft animierePartikel-Funktion auf.



// Client Funktionalität - ist Frontend im Browser------------------------
// ------------------------------------------------------------
// ------------------------------------------------------------
let urlDesServers: string = "http://localhost:5002"; // Info, kann unten im Code natürlich nur auf Server zugreifen, wenn Server läuft und wenn url stimmt.

// Verbindet einen click Event-Listener mit dem Speichere Rakete Button.
let speichereRaketeButton: HTMLElement = <HTMLElement>document.getElementById("speichere_rakete_button_id")
speichereRaketeButton.addEventListener("click", handleClickSpeichern);
// Diese Funktion wird aufgerufen, wenn click Event-Listener zu speichere_rakete_button_id triggered.
async function handleClickSpeichern(_event: Event): Promise<void> {
    // Diese Daten werden an Server (Node) geschickt.
    let dieseDatenAnServerSenden: FormData = new FormData();
    dieseDatenAnServerSenden.append("farbe", auswahlNutzer.farbe); // key-value Paar.
    dieseDatenAnServerSenden.append("explosionskraft", auswahlNutzer.explosionskraft);
    dieseDatenAnServerSenden.append("funkengroesse", auswahlNutzer.funkengroesse);
    dieseDatenAnServerSenden.append("funkenanzahl", auswahlNutzer.funkenanzahl);
    //let a = formData.get("farbe");
    //let b = formData.getAll("farbe")
    //console.log(a)
    //console.log(b)
    let query: URLSearchParams = new URLSearchParams(<any>dieseDatenAnServerSenden);
    
    // Und das ist die Antwort vom Server.
    let antwortVomServer: Response = await fetch(urlDesServers + "?" + query.toString()); // await, damit Code wartet, bis Rückgebewert von Funktion hinter await, hier fetch(...), erhalten ist (wenn await in Fuktion verwendet wird, dann vor function async schreiben).
    let antwortVomServerText: string = await antwortVomServer.text();
    werteInDB = antwortVomServerText;
    alert(antwortVomServerText);
}


// Verbindet einen click Event-Listener mit dem Lösche alle gespeicherten Raketen Button.
let loescheAlleGespeichertenRaketen: HTMLElement = <HTMLElement>document.getElementById("loesche_alle_raketen_button_id")
loescheAlleGespeichertenRaketen.addEventListener("click", handleClickLoeschen);
// Diese Funktion wird aufgerufen, wenn click Event-Listener zu loesche_alle_raketen_button_id triggered.
async function handleClickLoeschen(_event: Event): Promise<void> {
    // Diese Daten werden an Server (Node) geschickt.
    let dieseDatenAnServerSenden: FormData = new FormData();
    dieseDatenAnServerSenden.append("loeschen", "alles_loeschen_in_db"); // key-value Paar.
    let query: URLSearchParams = new URLSearchParams(<any>dieseDatenAnServerSenden);
    
    // Und das ist die Antwort vom Server.
    let antwortVomServer: Response = await fetch(urlDesServers + "?" + query.toString()); // await, damit Code wartet, bis Rückgebewert von Funktion hinter await, hier fetch(...), erhalten ist (wenn await in Fuktion verwendet wird, dann vor function async schreiben).
    let antwortVomServerText: string = await antwortVomServer.text();
    alert(antwortVomServerText);
}


// Verbindet einen click Event-Listener mit Raketen aus mongoDB laden Dropdown-Menü.
let ladeJaNeinRaketenAusDB: HTMLElement = <HTMLElement>document.getElementById("ausdbladen_id")
ladeJaNeinRaketenAusDB.addEventListener("change", handleChangeDBLaden);
async function handleChangeDBLaden(_event: Event): Promise<void> {
    // Diese Daten werden an Server (Node) geschickt.
    let dieseDatenAnServerSenden: FormData = new FormData();
    dieseDatenAnServerSenden.append("nicht hinzufügen", "nichts zu db hinzufügen");
    let query: URLSearchParams = new URLSearchParams(<any>dieseDatenAnServerSenden);
    
    // Und das ist die Antwort vom Server.
    let antwortVomServer: Response = await fetch(urlDesServers + "?" + query.toString());
    let antwortVomServerText: string = await antwortVomServer.text();
    werteInDB = antwortVomServerText
}