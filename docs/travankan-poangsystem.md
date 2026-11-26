# Travankans poängsystem (standardvikter)

Avläst från Travankans `Rankinformation` och `Rankstats` för cirka 100 lopp
(2026-11-24 till 2026-11-27) och kontrollerat mot ATG:s API.
Slutkontrollen gjordes på 28 lopp (316 hästar) som inte körts än, så att
odds och statistik var desamma i båda källorna.

**Total = summan av alla kolumner. Rank = sortering på Total, fallande.**
Strukna hästar får ingen Total.

## Typ A: rangordning inom loppet, bara de 6 bästa får poäng

Hästarna sorteras på värdet. Plats 1–6 får poängen nedan, plats 7 och sämre får 0.
Lika värden delar inte poäng: lägst startnummer får den högre platsen
(för `Tid` vinner den tid som är satt senast).

| Kol | Betydelse | ATG-källa | P1 | P2 | P3 | P4 | P5 | P6 | Träff |
|---|---|---|---|---|---|---|---|---|---|
| `Odds` | Lägst vinnarodds | `pools.vinnare.odds` (stigande) | 800 | 700 | 600 | 450 | 300 | 150 | 99 % |
| `H$` | Intjänat per start, karriär | `horse.statistics.life.earningsPerStart` | 600 | 500 | 400 | 300 | 200 | 100 | 100 % |
| `HV%` | Vinstprocent, karriär (även 0 % rangordnas, hästar utan starter utesluts) | `life.winPercentage` | 600 | 500 | 400 | 300 | 200 | 100 | 100 % |
| `Pris` | Snitt av förstapriset i de 4 senaste starterna (strukna och lopp med förstapris 0 hoppas över) | `records[].race.firstPrize` | 600 | 500 | 400 | 300 | 200 | 100 | 97 % |
| `M$` | Intjänat totalt, karriär | `life.earnings` | 450 | 375 | 300 | 225 | 150 | 75 | 100 % |
| `Tid` | Bästa km-tid någonsin med samma startmetod och distanskategori (kort ≤1800, medel ≤2400, lång). Galopplopp räknas, strukna inte | `records[].kmTime` | 475 | 400 | 325 | 250 | 175 | 100 | 95 % |
| `K$` | Kuskens intjänat per start, innevarande + föregående år | `driver.statistics.years[y, y-1]` (`earnings` / `starts`) | 475 | 400 | 325 | 250 | 175 | 100 | 100 % |
| `KV%` | Kuskens vinstprocent, innevarande + föregående år | `years[y, y-1]` (`placement["1"]` / `starts`) | 425 | 350 | 275 | 200 | 125 | 50 | 100 % |
| `K-F` | Kuskens vinstprocent de senaste 21 dagarna, idag inräknat | Kräver kuskens resultat (finns inte i ATG:s start-API) | 475 | 400 | 325 | 250 | 175 | 100 | regeln verifierad* |
| `T-F` | Tränarens vinstprocent de senaste 21 dagarna | Kräver tränarens resultat | 475 | 400 | 325 | 250 | 175 | 100 | tabellen verifierad |
| `KA` | Kuskens vinstprocent på dagens bana sedan 2014-04 | Kräver lång resultathistorik | 375 | 325 | 275 | 225 | 175 | 125 | tabellen verifierad |

\* Gustav Johansson: 24 starter de senaste 21 dagarna med 3 segrar = 12 %, exakt som Travankan visar.

## Typ B: poäng per häst

### `Spår`: fast tabell per startspår
Spårnummer: autostart använder **startnumret** (`start.number`), voltstart använder `postPosition`
(spåret inom distansgruppen vid tillägg). Träff: 100 %.

| Spår | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12+ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Auto | 525 | 475 | 525 | 575 | 625 | 375 | 300 | 125 | 350 | 375 | 250 | 75 |
| Volt | 650 | 450 | 525 | 400 | 250 | 375 | 300 | 250 | 150 | 125 | 75 | 50 |

### `Till`: distanstillägg
`start.distance - race.distance`: 0 m → 0, 20 m → **450**, 40 m → **600**, 60 m → **750**. Träff: 100 %.
(Tillägg ger alltså pluspoäng, eftersom det är de bättre hästarna som har tillägg.)

### `Plc`: tidigare placeringar
De **6 senaste startade** loppen (`scratched` hoppas över; diskade och galopperande räknas med):
1:a = **225**, 2:a = **150**, 3:a = **75**. Träff: 97 %.

### `AS`: placeringar med aktuell skobalans
De **3 senaste startade** loppen där skorna (fram och bak, sko eller barfota) var desamma som idag.
Sulkyn räknas inte. 1:a = **300**, 2:a = **150**, 3:a = **75**. Träff: 98 %.

### `Bsp`: placeringar från bakspår
Bland de **6 senaste startade** loppen räknas de med bakspår
(autostart `postPosition` ≥ 9, voltstart ≥ 8): 1:a = **250**, 2:a = **175**, 3:a = **100**. Träff: 100 %.

### `Skor`: skobyte jämfört med föregående start
Uppslag på `shoes.front/back.{hasShoe, changed}`. Träff: 99 %.

| Fram | Bak | Poäng |
|---|---|---|
| oförändrad | oförändrad | 0 |
| **av** (barfota) | oförändrad sko | +500 |
| oförändrad sko | **av** | +500 |
| **av** | **av** | +1000 |
| **av** | barfota (oförändrad) | +500 |
| barfota (oförändrad) | **av** (barfota runt om) | −500 |
| **på** (sko) | oförändrad sko | −500 |
| oförändrad sko | **på** | −500 |
| **på** | **på** | −1000 |
| barfota (oförändrad) | **på** | −500 |
| **på** | barfota (oförändrad) | +500 |
| **på** | **av** | +250 |
| **av** | **på** | −250 |

## Typ C: topplista med flera poster per häst (`F500`, `S500`)
Topp 3 av de snabbaste **första 500 m** (F500) och **sista 500 m** (S500) bland fältets
tidigare starter. En häst kan ha flera av platserna. Plats 1/2/3 = **300/150/75**, och hästen får
summan av sina platser (450 = plats 1+2, 525 = plats 1+2+3, 375 = plats 1+3).
Kräver sektionstider, som **inte finns i ATG:s API**. Står för cirka 2 % av alla poäng.

## Inte identifierat
- `V75` (cirka 5 % av alla poäng). Hästarna rangordnas efter poängen, men nivåerna (175–1475,
  steg om 25) har inte gått att knyta till placeringar, prisnivå, V-spelslopp, startpoäng,
  tider eller form. Den bygger troligen på data som inte finns i ATG:s start-API.
- `AV` (avelshingst), `AB` (avelshingst + balans), `ÅT` (årstid): **0 i standardinställningen**.

## Avvikelser mot ATG-data
De få procent som inte stämmer beror nästan helt på datakällan, inte på reglerna:
- Utländska starter (NO/FI) saknar resultat eller förstapris hos ATG men finns hos Travankan.
- Enstaka lopp har olika förstapris i Travankan och ATG.
- Travankans hästvy döljer lopp utan spel (junior, amatör), men de räknas i poängen.
  ATG:s `records` innehåller dem.

## Hur nära en kopia kommer
Med bara ATG-data (allt utom K-F, T-F, KA, V75, F500 och S500, som tillsammans är cirka 23 % av poängen)
blir etta samma häst som Travankans i 22 av 28 lopp, och topp 3 överlappar till 83 %.
För att komma närmare behövs kusk- och tränarresultat för de senaste 21 dagarna (K-F, T-F), till exempel
genom att cacha ATG:s dagliga resultat, och kuskstatistik per bana (KA).
