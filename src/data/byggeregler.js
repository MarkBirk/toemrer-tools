export const byggeregler = [
  {
    kategori: 'Byggetilladelse & anmeldelse',
    regler: [
      { titel: 'Carport, udhus, drivhus ≤ 50 m²', tekst: 'Kræver ikke byggetilladelse hvis samlet sekundær bebyggelse er ≤ 50 m². Skal stadig overholde byggeretten (afstand, højde). Anmeld til kommunen via Byg og Miljø.' },
      { titel: 'Tilbygning', tekst: 'Kræver altid byggetilladelse. Ansøg via Byg og Miljø (bygogmiljoe.dk).' },
      { titel: 'Terrasse / hævet terrasse', tekst: 'Terrasse i terrænniveau: ingen tilladelse. Hævet terrasse (> 30 cm over terræn): kontakt kommunen – kan kræve tilladelse.' },
      { titel: 'Indvendig ombygning', tekst: 'Bærende vægge kræver byggetilladelse. Ikke-bærende skillevægge: typisk ingen tilladelse.' },
    ]
  },
  {
    kategori: 'Byggeretten (BR18)',
    regler: [
      { titel: 'Bebyggelsesprocent', tekst: 'Parcelhus: max 30%. Rækkehus: max 40%. Tjek altid lokalplan.' },
      { titel: 'Skel-afstand', tekst: 'Min. 2,5 m til skel (bygninger). Sekundær bebyggelse ≤ 50 m²: kan placeres nærmere (se BR18 §176-§186).' },
      { titel: 'Bygningshøjde', tekst: 'Max 8,5 m til kip. Skråhøjdegrænseplan: 1,4 × afstand til skel + 2,5 m.' },
      { titel: 'Etager', tekst: 'Max 2 etager (bolig). Kælder tæller ikke med hvis < 1,25 m over terræn.' },
    ]
  },
  {
    kategori: 'Konstruktion & bæreevne',
    regler: [
      { titel: 'Bærende vægge', tekst: 'Må ikke ændres uden ingeniørberegning og byggetilladelse. Typisk reglar ≥ 45×95 mm.' },
      { titel: 'Bjælkelag', tekst: 'Dimensioneres efter spænd, belastning og c/c-afstand. Se SBI-anvisninger eller kontakt ingeniør.' },
      { titel: 'Spær', tekst: 'Fabriksspær dimensioneres af producenten. Håndlavede spær kræver ingeniørberegning for spænd > 4-5 m.' },
      { titel: 'Vindafstivning', tekst: 'Alle bygninger skal vindafstivers. Typisk med krydsfiner/OSB på ydervægge eller skråbånd.' },
    ]
  },
  {
    kategori: 'Brand',
    regler: [
      { titel: 'Brandvæg / brandkam', tekst: 'Rækkehuse/sommerhuse med fælles væg: brandvæg EI 60. Brandkam 200 mm over tag.' },
      { titel: 'Røgalarm', tekst: 'Påbudt i alle boliger (min. 1 pr. etage). Anbefalet i alle soverum.' },
      { titel: 'Flugtveje', tekst: 'Min. 1 dør + 1 vindue pr. rum der bruges til ophold. Vindue: min. 0,5 m² åbning.' },
    ]
  },
  {
    kategori: 'Isolering & energi',
    regler: [
      { titel: 'Ydervæg (nybyg)', tekst: 'U-værdi ≤ 0,18 W/m²K. Typisk 200-250 mm mineraluld.' },
      { titel: 'Tag/loft (nybyg)', tekst: 'U-værdi ≤ 0,12 W/m²K. Typisk 300-400 mm mineraluld.' },
      { titel: 'Terrændæk (nybyg)', tekst: 'U-værdi ≤ 0,10 W/m²K. Typisk 300 mm EPS/XPS.' },
      { titel: 'Vinduer (nybyg)', tekst: 'U-værdi ≤ 1,2 W/m²K (ramme+glas). Energiruder er standard.' },
      { titel: 'Dampspærre', tekst: 'Altid på den varme side af isoleringen. Tapes omhyggeligt i samlinger.' },
    ]
  },
  {
    kategori: 'Vådrum',
    regler: [
      { titel: 'Vådrumsikring', tekst: 'Vådrum skal udføres af virksomhed med dokumenteret kompetence (f.eks. BVT-ordningen).' },
      { titel: 'Membran', tekst: 'Skal anvendes i vådzone (bruseområde) og bag badekar. Membranen skal føres min. 100 mm op over gulvafløb.' },
      { titel: 'Fald mod afløb', tekst: 'Min. 20 mm fald pr. meter mod afløb i bruseareal.' },
      { titel: 'Gulvvarme i vådrum', tekst: 'Anbefales. Skal monteres af autoriseret elinstallatør (el-gulvvarme) eller VVS (vand).' },
    ]
  },
  {
    kategori: 'Terrasse & udendørs',
    regler: [
      { titel: 'Trykimprægneret træ', tekst: 'Klasse NTR-AB til konstruktion i jordkontakt/fundament. NTR-A til brædder over jord.' },
      { titel: 'Fundament terrasse', tekst: 'Punktfundamenter under strøer. Typisk betonklodser eller nedstøbt rørstolpe. Frostfri dybde: 900 mm.' },
      { titel: 'Rækværk', tekst: 'Hævet terrasse > 1 m over terræn: rækværk påbudt. Min. højde 1000 mm, max åbning 89 mm.' },
    ]
  },
  {
    kategori: 'El & VVS',
    regler: [
      { titel: 'El-arbejde', tekst: 'Al fast el-installation SKAL udføres af autoriseret elinstallatør. Strafbart at udføre selv.' },
      { titel: 'VVS-arbejde', tekst: 'Arbejde på vandinstallation og afløb SKAL udføres af autoriseret VVS-installatør. Simpelt vedligehold (pakning, toiletsæde) kan gøres selv.' },
      { titel: 'Kontakt før du graver', tekst: 'Ring LedningsEjer (ler.dk) før du graver. Lovpligtigt.' },
    ]
  }
];

// Disclaimer shown at bottom of regler
export const reglerDisclaimer = 'OBS: Disse regler er generelle tommelfingerregler og vejledninger. Tjek ALTID gældende regler, lokalplaner og kommunale krav for dit specifikke projekt. Ved tvivl – kontakt kommunen eller en rådgivende ingeniør.';
