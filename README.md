# TotoMondiale 2026 — Guida al deploy e all'uso

## Stack
- **Frontend**: React 18 + Tailwind CSS 3 + Vite
- **Database**: Supabase (gratuito)
- **Hosting**: Vercel (gratuito)
- **Risultati**: API-Football (api-football.com, piano free)

---

## 1. Configurazione Supabase

### 1.1 Crea il progetto
1. Vai su [supabase.com](https://supabase.com) e crea un nuovo progetto
2. Scegli una regione europea (es. `eu-west-1`)
3. Annota la **URL** e la **anon key** da `Settings > API`

### 1.2 Crea il database
Apri l'SQL Editor di Supabase ed esegui nell'ordine:

```
1. Incolla e lancia: supabase/schema.sql
2. Incolla e lancia: supabase/seed.sql
```

> **Nota sui gironi**: Il seed include 48 squadre con gruppi *placeholder*.
> Verifica che corrispondano al sorteggio reale e aggiorna direttamente
> dalla tabella `teams` in Supabase > Table Editor se necessario.

---

## 2. Configurazione progetto locale

```bash
# Clona/scarica il progetto, poi:
cd "TOTOMONDIALE 2026"
npm install
```

Crea il file `.env`:
```bash
cp .env.example .env
```

Compila `.env` con i tuoi valori:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ADMIN_PASS_HASH=<SHA-256 della tua password>
```

### 2.1 Genera il tuo hash SHA-256
**Su Mac/Linux:**
```bash
echo -n "tuapassword" | shasum -a 256
```

**Online (privato):**
Vai su https://emn178.github.io/online-tools/sha256.html

Copia l'hash (64 caratteri esadecimali) e incollalo in `VITE_ADMIN_PASS_HASH`.

---

## 3. Test in locale

```bash
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173)

---

## 4. Deploy su Vercel

### 4.1 Prima volta
1. Vai su [vercel.com](https://vercel.com) e accedi con GitHub
2. Fai il push del progetto su GitHub
3. In Vercel: **New Project → Import** il repo
4. In **Environment Variables** aggiungi le 3 variabili dal tuo `.env`
5. Clicca **Deploy**

### 4.2 Aggiornamenti
Ogni `git push` su `main` fa il redeploy automatico.

### 4.3 Cambiare la password admin
Genera un nuovo hash e aggiorna `VITE_ADMIN_PASS_HASH` in:
`Vercel > Project > Settings > Environment Variables`

Poi fai un redeploy: `Vercel > Deployments > Redeploy`

---

## 5. Guida rapida per l'Admin

### Primo avvio
1. Vai su `[tuo-dominio]/admin` oppure clicca "Accesso amministratore" nella login
2. Inserisci la password admin
3. Vai su **Impostazioni** → inserisci la API key di API-Football
4. Cambia lo stato del torneo a "In arrivo"

### Gestione partecipanti
1. Vai su **Codici**
2. Inserisci nome e cognome → clicca "Genera codice"
3. Copia il codice e invialo alla persona (es. via WhatsApp)
4. Clicca "Salva partecipante" per registrarlo

### Inserire i risultati
**Manualmente:**
1. Vai su **Risultati**
2. Seleziona il girone con i tab A-L
3. Inserisci il punteggio e clicca "Salva risultato"

**Via API-Football (automatico):**
1. Configura la API key nelle Impostazioni
2. Clicca "Sincronizza" nella tab Risultati

### Aggiornare il torneo
1. Vai su **Torneo**
2. Imposta le 4 semifinaliste quando si conoscono
3. Imposta le 2 finaliste
4. Imposta il vincitore
5. Inserisci il capocannoniere (separa con virgola se più a pari)

---

## 6. Sistema di punteggio

| Evento | Punti |
|--------|-------|
| Esito 1X2 corretto (girone) | 1 |
| Semifinalista indovinata (×4) | 1 cad. |
| Finalista indovinata (×2) | 2 cad. |
| Vincitore del Mondiale | 5 |
| Capocannoniere | 4 |
| **Massimo teorico** | **65** |

---

## 7. Montepremi (N partecipanti × €25)

```
Totale lordo         = N × 25
Gestori (15%)        = Totale × 0.15
Montepremi netto     = Totale × 0.85
Ultimo classificato  = 25€ (se singolo)
Distribuibile        = Netto − 25
  1° posto           = 50% di Distribuibile
  2° posto           = 30% di Distribuibile
  3° posto           = 20% di Distribuibile
```

**Ex aequo:**
- Più ultimi: il 25€ decade e va al 1° posto
- Più primi: tutto (1°+2°+3°) diviso equamente tra i primi
- Un primo, più secondi: 2°+3° accorpati e divisi tra i secondi

---

## 8. Note tecniche

- **Autenticazione**: codici personali (nessuna email/password per i partecipanti)
- **La schedina è irrevocabile** dopo l'invio
- **Classifica**: calcolata in tempo reale lato client
- **API-Football free plan**: 100 chiamate/giorno — usa la sync manuale nei giorni senza partite

## 9. Struttura file principale

```
src/
├── pages/
│   ├── Login.jsx          → accesso con codice personale
│   ├── Schedina.jsx       → compilazione pronostici (72 partite + avanzamento)
│   ├── MySchedulina.jsx   → riepilogo schedina inviata
│   ├── Classifica.jsx     → classifica pubblica + montepremi
│   └── Admin.jsx          → pannello admin (codici, risultati, torneo)
├── lib/
│   ├── supabase.js        → tutte le query al database
│   ├── scoring.js         → calcolo punti e premi (incl. ex aequo)
│   ├── utils.js           → generatore codici, hash SHA-256, formattazione
│   └── apiFootball.js     → integrazione API-Football
└── data/
    └── players.js         → lista giocatori per autocomplete capocannoniere
```
