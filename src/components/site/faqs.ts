import type { FaqItem } from './Faq'

/*
 * Every question the site answers, in one place. Each service page shows its
 * own group at the bottom; the FAQ page (/intrebari-frecvente) shows them all,
 * with the general ones first. Edit a question here and both places change.
 *
 * No prices or response times are promised in these answers until they are
 * set in writing.
 */

export const GENERAL_FAQ: FaqItem[] = [
  {
    question: 'Cum începem un proiect?',
    answer:
      'Ne scrii pe scurt ce vrei să rezolvi. Discutăm despre firmă și despre ce trebuie să facă proiectul, apoi primești o propunere în scris cu ce construim, termenul și prețul. Începem doar după ce ești de acord cu ea.',
  },
  {
    question: 'Cum se stabilește prețul?',
    answer:
      'Îl primești în scris, înainte să începem. Pentru site-uri, magazine și identitate vizuală e de obicei un preț fix. Pentru aplicațiile care cresc în etape, fiecare etapă are prețul și termenul ei.',
  },
  {
    question: 'Cine scrie textele site-ului?',
    answer:
      'Tu cunoști firma, așa că informația vine de la tine. Noi facem structura și punem textele în forma în care se citesc ușor pe site și sunt înțelese de Google.',
  },
  {
    question: 'Ce se întâmplă dacă nu îmi place designul?',
    answer:
      'Designul îl vezi și îl aprobi înainte să îl programăm. Așa, schimbările mari se fac atunci când costă puțin, nu după ce site-ul e gata.',
  },
  {
    question: 'Folosiți AI ca să faceți site-urile?',
    answer:
      'Folosim și instrumente cu AI, ca orice echipă la zi. Dar fiecare linie de cod ajunge în proiect pentru că am înțeles-o și am verificat-o, nu pentru că a fost generată.',
  },
  {
    question: 'Al cui e site-ul după ce îl predați?',
    answer:
      'Al tău. Domeniul e pe numele firmei tale, iar la predare primești codul, parolele și instrucțiunile, ca orice alt programator să îl poată prelua.',
  },
]

export const PRESENTATION_SITES_FAQ: FaqItem[] = [
  {
    question: 'Cât costă un site de prezentare?',
    answer:
      'Depinde de câte pagini are, dacă textele și pozele le ai deja și de ce trebuie să facă în plus (rezervări, mai multe limbi, blog). Prețul îl primești fix, în scris, înainte să începem, și nu se schimbă pe parcurs dacă nu se schimbă cerințele.',
  },
  {
    question: 'În cât timp e gata site-ul?',
    answer:
      'De obicei câteva săptămâni, în funcție de numărul de pagini și de cât de repede avem textele și pozele. Termenul exact e scris în propunere.',
  },
  {
    question: 'Pot modifica singur textele și pozele?',
    answer:
      'Da. Site-ul vine cu un panou de administrare în română, din care schimbi texte, poze și articole fără să atingi codul. La lansare îți arătăm cum se folosește.',
  },
  {
    question: 'Site-ul apare în Google de la început?',
    answer:
      'Îl trimitem la Google în ziua lansării și apare de obicei în câteva zile. Locul pe care îl ocupă în rezultate se construiește în timp, din conținut bun și din viteza site-ului, iar pe amândouă le pregătim de la început.',
  },
  {
    question: 'Ce se întâmplă după lansare?',
    answer:
      'Site-ul, domeniul și codul sunt ale tale. Dacă vrei ca cineva să se ocupe în continuare de actualizări, copii de siguranță și modificări, avem și mentenanță lunară.',
  },
]

export const SHOPS_FAQ: FaqItem[] = [
  {
    question: 'Cât costă un magazin online?',
    answer:
      'Depinde de câte produse ai, de câte variante are fiecare și de programele cu care trebuie să se lege: plăți, curier, facturare, gestiune. Prețul îl primești fix, în scris, după ce discutăm despre cum vinzi acum.',
  },
  {
    question: 'Ce procesatori de plăți integrați?',
    answer:
      'Pe cel cu care lucrezi deja sau pe cel care se potrivește volumului și produselor tale. Legăm orice procesator care oferă o interfață pentru programatori, adică aproape toți cei folosiți în România.',
  },
  {
    question: 'Facturile se emit automat, cu e-Factura?',
    answer:
      'Da. Factura se emite în momentul plății, cu seria firmei tale, și pleacă în SPV ca e-Factura. Dacă folosești deja un program de facturare, magazinul îi trimite comanda și factura se emite acolo.',
  },
  {
    question: 'Se leagă de curier pentru AWB-uri?',
    answer:
      'Da. AWB-ul se generează din comandă, cu adresa și greutatea completate, iar clientul primește numărul lui pe email. Lucrăm cu curierul pe care îl folosești deja.',
  },
  {
    question: 'Pot adăuga produse singur?',
    answer:
      'Da, dintr-un panou de administrare în română: produse, poze, prețuri, stocuri și reduceri. Dacă ai multe produse, le putem importa dintr-un fișier Excel.',
  },
]

export const APPS_FAQ: FaqItem[] = [
  {
    question: 'Cum estimați costul unei aplicații?',
    answer:
      'Pornim de la o discuție despre cum lucrați acum. Din ea scriem lista etapelor, iar pentru prima etapă primești un preț și un termen fixe. Etapele următoare le estimăm pe rând, după ce prima e folosită, pentru că abia atunci se vede sigur ce trebuie.',
  },
  {
    question: 'Codul îmi aparține?',
    answer:
      'Da. La predare primești codul întreg, accesul la server și documentația, ca aplicația să poată fi preluată de orice programator.',
  },
  {
    question: 'Se poate lega de programele pe care le folosim deja?',
    answer:
      'De obicei, da. Dacă programul are o interfață prin care alte aplicații îi pot trimite și citi date, o folosim. Dacă nu are, căutăm altă cale, de exemplu fișiere exportate automat, și îți spunem dinainte ce se poate.',
  },
  {
    question: 'Cine o întreține după lansare?',
    answer:
      'Noi, dacă vrei, cu un abonament lunar care acoperă actualizările, copiile de siguranță și problemele apărute. Funcțiile noi le ofertăm separat, ca etape noi.',
  },
  {
    question: 'Cât durează până o putem folosi?',
    answer:
      'Prima etapă e aleasă tocmai ca să fie gata în câteva săptămâni, nu în câteva luni. Termenul exact e scris în propunere.',
  },
]

export const IDENTITY_FAQ: FaqItem[] = [
  {
    question: 'Cât costă o identitate vizuală?',
    answer:
      'Depinde de ce îți trebuie: doar logo, sau logo cu ghid de brand și materiale tipărite. Prețul îl primești fix, în scris, după prima discuție.',
  },
  {
    question: 'Faceți și doar logo?',
    answer:
      'Da. Și atunci primești logo-ul în toate variantele și o pagină cu regulile de folosire, ca să nu fie deformat sau recolorat de primul care îl folosește.',
  },
  {
    question: 'Primesc fișierele sursă?',
    answer:
      'Da, vectoriale și gata de tipar, plus variantele pentru site și rețele sociale. Drepturile de folosire trec la firma ta prin contract.',
  },
  {
    question: 'Puteți actualiza un logo pe care îl am deja?',
    answer:
      'Da. Uneori e nevoie doar de o curățare: proporții, culori, o variantă care se vede bine la dimensiuni mici. Îți spunem dacă e cazul înainte să propunem ceva nou.',
  },
  {
    question: 'În cât timp e gata?',
    answer:
      'De obicei în câteva săptămâni, în funcție de câte materiale aplicăm. Termenul exact e scris în propunere.',
  },
]

export const MAINTENANCE_FAQ: FaqItem[] = [
  {
    question: 'Ce înseamnă mentenanța unui site?',
    answer:
      'Tot ce ține site-ul sigur și funcțional după lansare: actualizări de securitate, copii de siguranță, reînnoirea certificatului și a domeniului, verificarea că site-ul răspunde și micile modificări de conținut.',
  },
  {
    question: 'Am nevoie de mentenanță dacă site-ul merge bine acum?',
    answer:
      'Site-urile nu se strică de la sine, dar programele pe care rulează primesc constant actualizări de securitate. Un site lăsat neactualizat ani de zile devine ținta ușoară a atacurilor automate, iar o problemă apărută atunci e mai scumpă decât prevenirea ei.',
  },
  {
    question: 'Preluați și site-uri făcute de altcineva?',
    answer:
      'Da. Ne uităm întâi pe site și îți spunem în scris în ce stare e, ce trebuie reparat înainte și cât ar costa mentenanța lunară.',
  },
  {
    question: 'Cât costă mentenanța unui site?',
    answer:
      'Depinde de site: un site de prezentare cere mai puțină muncă decât un magazin online cu plăți și stocuri. Prețul lunar îl primești în scris după ce vedem site-ul, și nu se schimbă fără să te anunțăm.',
  },
  {
    question: 'Ce se întâmplă cu site-ul dacă renunț la abonament?',
    answer:
      'Site-ul rămâne al tău. Îți predăm accesul la găzduire, domeniu și cod, plus ultima copie de siguranță, ca să-l poată prelua oricine.',
  },
]

export const HOSTING_FAQ: FaqItem[] = [
  {
    question: 'Pot păstra domeniul unde e acum?',
    answer:
      'Da. Domeniul poate rămâne la firma la care l-ai înregistrat, schimbăm doar unde trimite. Dacă preferi să ne ocupăm noi și de el, îl transferăm, tot pe numele firmei tale.',
  },
  {
    question: 'Ce se întâmplă cu emailul firmei când mutați site-ul?',
    answer:
      'Rămâne exact unde e. Înainte să schimbăm ceva la domeniu, notăm înregistrările de care depinde emailul și le păstrăm la fel, ca niciun mesaj să nu se piardă.',
  },
  {
    question: 'Am nevoie de certificat SSL?',
    answer:
      'Da. Fără el, browserele afișează avertismentul de site nesigur, iar formularele nu sunt protejate. Îl instalăm noi și se reînnoiește automat.',
  },
  {
    question: 'Cât costă găzduirea?',
    answer:
      'Depinde de site: un site de prezentare cere mult mai puțin decât un magazin online cu mii de produse. Prețul îl primești în scris, împreună cu tot ce include.',
  },
  {
    question: 'Ce se întâmplă dacă vreau să mut site-ul în altă parte?',
    answer:
      'Îți dăm o copie completă a site-ului și a bazei de date și te ajutăm să muți domeniul. Nimic nu rămâne blocat la noi.',
  },
]

export const CRM_FAQ: FaqItem[] = [
  {
    question: 'Pot trimite facturile în SPV direct din aplicație?',
    answer:
      'Da, după ce legăm aplicația de SPV cu certificatul digital al firmei. Factura pleacă din aplicație, iar starea ei apare pe factură: în prelucrare, acceptată sau respinsă, cu motivul. Până la legătură, descarci fișierul XML din aplicație și îl încarci singur în SPV.',
  },
  {
    question: 'Pot emite facturi în euro?',
    answer:
      'Da, în lei, euro sau dolari, cu cursul BNR trecut pe factură. Pentru clienții din alte țări ale Uniunii, taxarea inversă se aplică după regimul fiscal din fișa clientului, fără să o bifezi de fiecare dată.',
  },
  {
    question: 'Cum corectez o factură emisă greșit?',
    answer:
      'O stornezi din aplicație. Factura de stornare se creează singură, cu aceleași linii cu minus, iar cea inițială rămâne neatinsă, așa cum cere contabilitatea. Orele facturate pe ea se eliberează și pot intra pe factura corectă.',
  },
  {
    question: 'Pot transforma o proformă în factură?',
    answer:
      'Da. Factura fiscală preia liniile proformei, iar proforma rămâne în aplicație, legată de ea, ca să se vadă drumul de la cerere la factură.',
  },
  {
    question: 'Cum se facturează abonamentele?',
    answer:
      'Stabilești o dată suma, frecvența și ziua emiterii. La fiecare perioadă, aplicația pregătește singură factura ca ciornă, iar tu doar o verifici și o emiți.',
  },
  {
    question: 'Cum primesc aplicația?',
    answer:
      'O instalăm pentru firma ta și o configurăm după cum facturezi: serii, conturi bancare, date fiscale. Prețul depinde de ce trebuie adaptat și îl primești în scris.',
  },
]

/** The groups as the FAQ page lists them, each linked to its service. */
export const FAQ_GROUPS: { id: string; title: string; href?: string; items: FaqItem[] }[] = [
  { id: 'general', title: 'Cum lucrăm', items: GENERAL_FAQ },
  {
    id: 'site-uri',
    title: 'Site-uri de prezentare',
    href: '/servicii/site-uri-de-prezentare',
    items: PRESENTATION_SITES_FAQ,
  },
  {
    id: 'magazine',
    title: 'Magazine online',
    href: '/servicii/magazine-online',
    items: SHOPS_FAQ,
  },
  { id: 'aplicatii', title: 'Aplicații web', href: '/servicii/aplicatii-web', items: APPS_FAQ },
  {
    id: 'identitate',
    title: 'Identitate vizuală',
    href: '/servicii/identitate-vizuala',
    items: IDENTITY_FAQ,
  },
  { id: 'mentenanta', title: 'Mentenanță', href: '/servicii/mentenanta', items: MAINTENANCE_FAQ },
  { id: 'gazduire', title: 'Găzduire', href: '/servicii/gazduire', items: HOSTING_FAQ },
  { id: 'crm', title: 'CRM și facturare', href: '/produse/crm', items: CRM_FAQ },
]
