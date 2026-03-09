export const homeFaq = [
  {
    q: 'Er beregningerne gratis at bruge?',
    a: 'Ja, alle 12 beregningsværktøjer er helt gratis og kræver ingen oprettelse af konto. Du kan bruge dem direkte i din browser.',
  },
  {
    q: 'Kan jeg stole på resultaterne?',
    a: 'Beregningerne er vejledende og baseret på gængse formler og standardmål. De erstatter ikke professionel rådgivning — tjek altid gældende bygningsreglement (BR18) og konsultér en fagperson ved tvivl.',
  },
  {
    q: 'Gemmes mine data?',
    a: 'Al data gemmes lokalt i din browser (localStorage). Ingen data sendes til en server. Du kan eksportere beregninger som PDF, CSV eller JSON.',
  },
  {
    q: 'Virker værktøjerne på mobilen?',
    a: 'Ja, alle værktøjer er designet mobile-first og fungerer på telefon, tablet og desktop. Tag dem med ud på byggepladsen.',
  },
  {
    q: 'Hvad er forskellen på Materialeberegner og Materialeliste?',
    a: 'Materialeberegneren beregner materialer ud fra mål (f.eks. terrassens længde og bredde). Materialelisten er en samlet oversigt, hvor du kan samle resultater fra flere beregninger eller tilføje materialer manuelt.',
  },
];

export const toolFaqs = {
  materialeberegner: [
    {
      q: 'Hvordan beregner jeg brædder til en terrasse?',
      a: 'Vælg fanen "Terrasse", indtast længde og bredde i meter, og angiv bræddebredde samt mellemrum. Beregneren giver dig antal brædder, strøer og skruer inkl. spild.',
    },
    {
      q: 'Hvad er en typisk spildprocent for træ?',
      a: 'Normalt regner man med 5-10% spild på terrasse og beklædning. Ved vinkler eller komplekse udskæringer kan spildet stige til 15%. Beregneren bruger som standard 10%.',
    },
    {
      q: 'Hvilket mellemrum skal der være mellem terrassebrædder?',
      a: 'Standard mellemrum er 5 mm for trykimprægneret træ og 5-8 mm for hårdttræ (f.eks. cumaru eller bangkirai). Træet vil krympe og udvide sig med fugt og temperatur.',
    },
  ],
  taghaeldning: [
    {
      q: 'Hvad er den mindste tilladte taghældning?',
      a: 'Det afhænger af tagmaterialet. Betontagsten kræver minimum 25°, tegl minimum 20-25°, og tagpap kan gå ned til 2-3°. Tjek altid producentens anvisninger.',
    },
    {
      q: 'Hvordan omregner jeg taghældning fra grader til procent?',
      a: 'Procent = tan(grader) × 100. F.eks. er 45° = 100%, 30° ≈ 57,7%, og 15° ≈ 26,8%. Beregneren klarer omregningen automatisk.',
    },
    {
      q: 'Hvad betyder taghældning i forholdstal (1:X)?',
      a: 'Forholdstallet 1:X angiver at taget stiger 1 enhed for hver X enheder vandret. F.eks. 1:2 betyder 26,6° eller 50%. Jo lavere X-tal, jo stejlere tag.',
    },
  ],
  'spaer-laengde': [
    {
      q: 'Hvordan beregner jeg spærlængden?',
      a: 'Indtast spændvidde (vandret afstand mellem understøtninger) og tagets rejsning (højdeforskel). Beregneren bruger Pythagoras til at finde den skrå spærlængde.',
    },
    {
      q: 'Hvad er kiphøjde?',
      a: 'Kiphøjde er den lodrette afstand fra tagfoden (spærfoden) til tagets højeste punkt (kippen). Den beregnes ud fra spændvidde og taghældning.',
    },
    {
      q: 'Skal jeg lægge udhæng til spærlængden?',
      a: 'Ja, husk at tilføje udhænget (typisk 30-60 cm) til den beregnede spærlængde. Beregneren viser den rene spærlængde — udhæng skal lægges til manuelt.',
    },
  ],
  'skruer-beslag': [
    {
      q: 'Hvor mange skruer skal jeg bruge per terrassebrædt?',
      a: 'Tommelfingerreglen er 2 skruer per strøer per brædt. Med strøer for hver 60 cm på en 4,8 m terrasse bruges ca. 18 skruer per brædt.',
    },
    {
      q: 'Hvilken type skruer bruger man til terrasse?',
      a: 'Brug syrefast (A4) rustfrie skruer til trykimprægneret træ. Typisk 5×60 mm eller 5×70 mm afhængigt af bræddetykkelse. Galvaniserede skruer kan korrodere i kontakt med imprægnering.',
    },
  ],
  'maal-konverter': [
    {
      q: 'Hvordan omregner jeg tommer til millimeter?',
      a: '1 tomme = 25,4 mm. F.eks. er 2" = 50,8 mm og 4" = 101,6 mm. Bemærk at "2×4 tommer" tømmer faktisk måler 45×95 mm i høvlet mål.',
    },
    {
      q: 'Hvad er forskellen på nominelle og faktiske mål?',
      a: 'Nominelle mål er betegnelsen (f.eks. 2×4"), mens faktiske mål er efter høvling og tørring (f.eks. 45×95 mm). Tømmer sælges typisk i faktiske mål i Danmark.',
    },
  ],
  tilbudsberegner: [
    {
      q: 'Hvordan beregner jeg en timepris som tømrer?',
      a: 'Timeprisen bør dække løn, kørsel, forsikring, værktøjsslid og avance. En typisk timepris for en selvstændig tømrer ligger mellem 350-550 kr. ekskl. moms (2024-priser).',
    },
    {
      q: 'Hvad er en normal avanceprocent på materialer?',
      a: 'En typisk avance på materialer er 10-20%. Nogle bruger en fast procent, andre lægger et fast beløb til. Beregneren giver dig mulighed for at angive din egen procent.',
    },
    {
      q: 'Skal moms altid med i et tilbud?',
      a: 'Ja, tilbud til private kunder skal altid inkludere 25% moms. Til erhvervskunder kan priser angives ekskl. moms, men det skal fremgå tydeligt.',
    },
  ],
  materialeliste: [
    {
      q: 'Hvordan eksporterer jeg min materialeliste?',
      a: 'Du kan eksportere som PDF (til print eller e-mail), CSV (til regneark), JSON (til andre systemer) eller kopiere som tekst. Brug knapperne under listen.',
    },
    {
      q: 'Kan jeg samle materialer fra flere beregninger?',
      a: 'Ja, brug knappen "Samlet liste" i hvert beregningsværktøj for at tilføje materialer til den samlede materialeliste. Gå til "Samlet materialeliste" i menuen for at se alt samlet.',
    },
  ],
  standardmaal: [
    {
      q: 'Hvad er standardmål for konstruktionstræ i Danmark?',
      a: 'Almindelige dimensioner er 45×95 mm, 45×120 mm, 45×145 mm, 45×195 mm og 45×220 mm. Tømmer fås typisk i længder fra 2,4 m til 6,0 m i spring af 30 cm.',
    },
    {
      q: 'Hvad er standardmål for gipsplader?',
      a: 'Standard gipsplade er 900×2400 mm eller 1200×2400 mm med 13 mm tykkelse. Til vådrum bruges specialplader (grøn eller cementbaseret) i tilsvarende mål.',
    },
  ],
  'bygge-noter': [
    {
      q: 'Hvor gemmes mine byggenoter?',
      a: 'Noterne gemmes lokalt i din browsers localStorage. De forsvinder ikke ved genstart, men slettes hvis du rydder browserdata. Eksportér vigtige noter som backup.',
    },
  ],
  'vaegt-beregner': [
    {
      q: 'Hvad vejer en kubikmeter fyrretræ?',
      a: 'Fyrretræ vejer typisk 450-550 kg/m³ afhængigt af fugtindhold. Frisksavet (grønt) træ kan veje op til 800 kg/m³. Ovntørret fyrretræ vejer ca. 420-480 kg/m³.',
    },
    {
      q: 'Hvor meget vejer en betonplade?',
      a: 'Beton vejer ca. 2.400 kg/m³. En typisk terrasseplade (40×40×5 cm) vejer ca. 19 kg. Letbeton (lecabeton) vejer ca. 500-1.800 kg/m³ afhængigt af type.',
    },
  ],
  skaereplan: [
    {
      q: 'Hvordan minimerer jeg spild ved tilskæring?',
      a: 'Skæreplanen optimerer automatisk rækkefølgen af snit for at minimere spild. Angiv dine ønskede mål og materiallængden — beregneren finder den bedste kombination.',
    },
    {
      q: 'Hvad er en savsnitsbredde (kerf)?',
      a: 'Savsnitsbredden er den mængde materiale saven fjerner. Typisk 2-3 mm for en rundsav. Beregneren tager højde for dette, så dine stykker passer præcist.',
    },
  ],
  'bygge-regler': [
    {
      q: 'Hvad er afstandskravet til skel?',
      a: 'Bygninger skal som udgangspunkt holde en afstand på 2,5 m til skel. Garager, carporte og udhuse under 50 m² kan opføres nærmere — dog højst 2,5 m i højden ved skel.',
    },
    {
      q: 'Hvornår kræver et byggeprojekt byggetilladelse?',
      a: 'Nybyggeri, tilbygninger, udestuer og større ombygninger kræver byggetilladelse. Carporte, overdækninger og udhuse under 50 m² skal blot anmeldes til kommunen.',
    },
    {
      q: 'Hvad er U-værdikravet for ydervægge i BR18?',
      a: 'BR18 kræver en U-værdi på maks. 0,18 W/(m²·K) for ydervægge ved nybyggeri. For tag/loft er kravet 0,12 og for terrændæk 0,10. Ved renovering gælder lempeligere krav.',
    },
  ],
};
