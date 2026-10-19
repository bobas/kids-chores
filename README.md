# Večerní plán

Malá místní aplikace s pěti profily pro denní úkoly dětí na společném rodinném tabletu. Nepotřebuje účty, analytiku, externí knihovny, písma ani připojení k internetu. České rozhraní je ve větvi `czech-translation`; původní anglická verze zůstává na větvi `main`.

Podrobná uživatelská specifikace v angličtině popisuje ovládání i srovnávací scénáře pro novou implementaci. [Popis aplikace](APP-USER-SPECIFICATION.md)

## GitHub Pages

Workflow v [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) sestaví a otestuje obě jazykové verze a publikuje je společně při změně větve `main` nebo `czech-translation`. Lze ho spustit také ručně přes **Actions → Deploy English and Czech → Run workflow**.

| Verze | Zdrojová větev | Adresa |
| --- | --- | --- |
| Anglická | `main` | https://bobas.github.io/kids-chores/ |
| Česká | `czech-translation` | https://bobas.github.io/kids-chores/cs/ |

1. Commitněte stejný workflow do obou větví. Při obvyklém postupu ho přidejte na `main` a přebazujte na něj `czech-translation`. Potom odešlete obě větve na GitHub.
2. V repozitáři otevřete **Settings → Pages → Build and deployment** a jako **Source** vyberte **GitHub Actions**.
3. Pokud prostředí **Settings → Environments → github-pages** omezuje povolené větve pro nasazení, povolte `main` i `czech-translation`.
4. Spusťte workflow ručně nebo odešlete další změnu do jedné z obou větví.

Obě adresy v daném prohlížeči sdílejí uložené děti, úkoly i denní pokrok. Offline mezipaměti jsou při sestavení oddělené pro každou jazykovou verzi. Výstup obsahuje soubory aplikace, samostatné HTML a licence.

## Spuštění na tabletu

1. Rozbalte tuto složku na počítači připojeném k domácí Wi-Fi.
2. Otevřete v této složce terminál a spusťte:

   ```sh
   python3 serve.py
   ```

   Ve Windows můžete místo toho použít `py serve.py`.
3. Nechte počítač i terminál zapnuté. Na tabletu otevřete vypsanou adresu, například `http://192.168.1.20:8080`. Pokud se adresa nevypíše, použijte místní IP adresu počítače. Obě zařízení musejí být ve stejné síti, připojení k internetu není potřeba.
4. V hamburger menu otevřete **Nastavení**, přidejte děti a vyberte jejich barvy. Potom otevřete **Úkoly** a nastavte úkoly, časy a přiřazení vybrané části dne. Platné změny se uloží při zavření nastavení.
5. Uložte si adresu do záložek a používejte vždy stejnou adresu i prohlížeč. Pevná rezervace DHCP v routeru může zabránit změně IP adresy počítače.

Server pouze poskytuje soubory aplikace. Nastavení a splněné úkoly zůstávají v prohlížeči tabletu a na server se neposílají. Nastavení na počítači se do tabletu nepřenáší.

Python můžete spustit také přímo na tabletu a otevřít `http://localhost:8080`. Přístup pouze z daného zařízení povolíte příkazem `python3 serve.py --host 127.0.0.1`.

## Starší tablet s Androidem 4.4

Pro tento tablet používejte **Firefox 68.11**. Aplikace cílí na Firefox 68 a novější; samotná verze Androidu nestačí, protože vestavěný prohlížeč může mít mnohem starší vykreslovací jádro. Původní systémový prohlížeč Androidu 4.4 není podporovaný.

Na tabletu otevřete stejnou adresu a port místního serveru jako obvykle. Po aktualizaci souborů stránku znovu načtěte; `serve.py` není potřeba restartovat. Pokud se stále ukazuje pouze záhlaví bez plánu, zavřete kartu a otevřete stejnou adresu znovu. Nemažte data webu, pokud nemáte zálohu plánu.

Podpora zahrnuje plán, hodiny, samostatné plnění dětí, nastavení a import/export záloh. Prohlížeč bez nativního dialogu dostane náhradní okno nastavení. Ikony úkolů, oslav i částic jsou vložené SVG obrázky. Vypadají stejně i bez emoji písem a bez připojení k internetu. Výběr ikony v nastavení ukazuje obrázek a nabízí české názvy; zálohy používají nový formát s pěti profily. U nepodporovaného prohlížeče nebo vypnutého JavaScriptu zůstane nad záhlavím upozornění místo nevysvětlené prázdné stránky.

## Samostatný soubor

Soubor `Evening garden.html` obsahuje celou aplikaci včetně češtiny. Otevřete ho v prohlížeči, který podporuje místní HTML soubory s JavaScriptem. Aplikace pak funguje bez serveru i bez sítě. Prohlížeče na počítači to běžně umožňují; prohlížeče a prohlížeče souborů na tabletech se liší. Pokud se soubor otevře pouze jako náhled nebo se neuchová nastavení, použijte místní server.

Přímo lze otevřít i `index.html`, pokud vedle něj zůstanou ostatní soubory aplikace.

Volitelný service worker umožňuje načtení bez sítě na podporovaných zabezpečených adresách, například `localhost`. Při běžném přístupu z tabletu přes `http://192.168...` musí být server dostupný při načítání stránky. Již otevřená aplikace funguje i po výpadku spojení, protože čas i ovládání zpracovává tablet.

## Ovládání

- **Úkoly** i **Nastavení** uloží platné změny při zavření křížkem, klávesou Escape nebo klepnutím mimo dialog. **Zahodit změny** opustí rozpracované úpravy daného editoru. Při chybě zůstane příslušné okno otevřené s vysvětlením.
- V Nastavení se upravuje 1–8 společných dětí, jejich barvy, formát hodin a oslavy. V okně Úkoly se upravuje 0–40 úkolů vybraného profilu včetně přiřazení dětem. Nové dítě začíná bez přiřazení. Jeho úkoly vyberte v editoru Úkoly.
- Každý úkol se zobrazí jednou vlevo s velkým obrázkem a názvem. Hodiny a časy se ukazují podle situace popsané níže. Vpravo jsou sloupce s políčky dětí. Zaškrtnutí i odškrtnutí změní pokrok daného dítěte a políčko pak dvě sekundy nepřijímá další změnu. Nepřiřazené děti mají místo políčka pomlčku.
- Časová osa přizpůsobuje výšku délce a obsahu úkolů. Delší úkoly dostanou více místa, krátké řádky pojmou obrázek, název, políčka a případné hodiny. Souběžné úkoly různých dětí se řadí pod sebe ve společném časovém úseku se zarovnanými sloupci a časovými značkami. Řádky se při změnách obsahu plynule zvětšují a zmenšují spolu se značkami osy.
- Mezery mezi úkoly zůstávají viditelné; od 30 minut se zobrazí jejich skutečná délka a značka zkrácení. Souběžné úkoly různých dětí se řadí pod sebe ve společném časovém úseku, kterým postupuje čára **TEĎ**. Světle zelené zvýraznění se zobrazí až po splnění úkolu všemi přiřazenými dětmi. Samotný začátek naplánovaného času zvýraznění nezapne.
- Čára **TEĎ** se aktualizuje každou sekundu a sleduje stejnou zkrácenou osu jako úkoly a mezery. Tlačítko **Teď** přesune pohled na aktuální čas, případně na první nebo poslední úkol mimo zobrazené období. Jména dětí zůstávají při posouvání nahoře; další sloupce lze posouvat do stran.
- Číselník, přesné časy a délka úkolu se zobrazují při jeho průběhu, u nejbližšího budoucího nedokončeného úkolu a u minulého úkolu, který ještě nesplnily všechny přiřazené děti. Vyhrazený čas je světle zelený u probíhajícího nebo příštího úkolu a světle červený u opožděného nedokončeného úkolu. Počáteční hodinová a minutová ručička a hnědá koncová ručička vysvětlují interval. Přechod přes dvanáctku se zobrazuje správně. U hodiny nebo delšího intervalu se vyplní celý číselník a délka se upřesní pod ním.
- V horní části je aktuální místní čas digitálně i na běžných analogových hodinách. Lze vybrat 24hodinový nebo 12hodinový formát s označením „dop.“ a „odp.“. Pokud právě žádný úkol neprobíhá, zobrazí se začátek dalšího úkolu a zbývající čas.
- Úkoly stejného dítěte se nesmějí časově překrývat ani přecházet přes půlnoc. Každý úkol musí být přiřazen alespoň jednomu dítěti. Různé děti mohou mít různé úkoly ve stejnou dobu.
- Splnění nejpozději v určený čas doprovází jeden z 20 denních motivů oslavy, včetně předčasného splnění. Pozdní běžné splnění doprovází jemná želví připomínka. Dokončení všech úkolů dítěte se posuzuje podle nejpozdějšího dnešního konce celého profilu a při včasném dokončení přinese pohár. Splnění všech přiřazených úkolů celé rodiny dostane společné uznání.
- Oslavy i želví zprávy zůstávají zobrazené po dobu čtení. Klepnutí nebo Escape je zavře až dvě sekundy po otevření. Zavírací klepnutí zpracuje překryv oslavy. Odškrtnutí oslavu nespouští. Oslavy lze v Nastavení vypnout nebo vyzkoušet. Respektují systémovou volbu omezeného pohybu.
- Splněné úkoly se každému dítěti o místní půlnoci vynulují. Jména, barvy a plán zůstávají uložené. Dítě bez přiřazených úkolů má přehled 0/0.
- **Zálohovat všechny profily** stáhne společné nastavení rodiny a běžné plány všech profilů. **Načíst všechny profily** připraví náhradu v Nastavení, která se použije při jeho zavření s platnými údaji. Záloha vynechává denní zaškrtnutí, oslavy a posuny. Zahodit změny zruší i připravený import.
- Starší zálohy s jediným plánem je před importem potřeba převést mimo aplikaci. Nepodporovaná uložená data zůstanou zachovaná a zpráva vysvětlí, jak načíst převedenou zálohu.
- Úložiště prohlížeče je vázané na adresu a port. Vymazáním dat webu se smaže i plán. Při nemožnosti ukládat se objeví upozornění. Aplikace nemá síťovou synchronizaci.

## Soubory a ověření

- `index.html`, `style.css`, `app.js`: rozhraní a ovládání aplikace.
- `routine.js`: pravidla plánu, ověření časů a správa denního pokroku.
- `serve.py`: místní server ze standardní knihovny Pythonu, zpřístupňující pouze soubory aplikace.
- `sw.js`, `manifest.webmanifest`, `icon.svg`: volitelná mezipaměť pro práci bez sítě a údaje pro domovskou obrazovku.
- `Evening garden.html`: samostatná sestavená verze; původní technický název souboru zůstává kvůli stávajícím odkazům.
- `build.py`: po změně zdrojů znovu vytvoří samostatný soubor. Spusťte `python3 build.py`.
- `test.cjs`: automatické testy pravidel a české verze. Spusťte `node test.cjs` s Node.js 18 nebo novějším. Pro běžné používání aplikace Node.js není potřeba.

Testy ověřují samostatné plnění, přiřazení, půlnoc, časové hranice, barvy, odmítnutí nepodporovaných záloh, zkrácenou osu, geometrii číselníku, češtinu a zachování vlastních názvů. Zahrnují také čekání po klepnutí a změnu želvího připomenutí na oslavu po opravě termínu. Kontrola v prohlížeči ověřuje nastavení, chybové zprávy, oslavy a čitelnost na tabletu.

## Ikony a licence

Grafika [Twemoji 15.1.0](https://github.com/jdecked/twemoji/tree/7407fa31c51be5ab45626b8ab5554d50cc8073f6) od Twitter, Inc. a dalších přispěvatelů je pod licencí [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Plné znění je v `LICENSE-TWEMOJI.txt`. Vybraných 105 SVG obrázků je přímo v `ICON_ART` v souboru `app.js`, takže fungují i v samostatném HTML a stávající server není potřeba restartovat. Kresby nejsou upravené; při vykreslení dostanou atributy pro stylování a přístupnost. Geometrické částice a ovládací symboly kreslí aplikace jako vektory. Není použitý Twemoji JavaScript ani síťové načítání obrázků.

## Zapnutý displej na celé obrazovce

Tlačítko celé obrazovky také zapne udržování displeje. Po opuštění celé obrazovky nebo skrytí stránky se udržování zastaví; po návratu do stále aktivní celé obrazovky se zkusí obnovit. Zelený okraj tlačítka označuje aktivní udržování. Pokud ho prohlížeč odmítne nebo přeruší, objeví se zpráva a klepnutí na stránku ho zkusí zapnout znovu.

Podporované prohlížeče používají Screen Wake Lock API. Firefox 68 a přístup přes místní HTTP používají přibalené tiché video podle [NoSleep.js 0.12.0](https://github.com/richtr/NoSleep.js/tree/07fcee254724ab1b79076fbc22f3dd447649a2eb). Video se nikam nestahuje a funguje i v samostatném HTML. Ukázky a postup jsou pod licencí MIT (Rich Tibbett); znění je v `LICENSE-NOSLEEP.txt` i vloženém zdroji aplikace.

Skutečné zabránění zhasnutí závisí také na prohlížeči, systému a úsporném režimu. Na tabletu ověřte, že v celé obrazovce displej zůstane zapnutý déle než obvyklý interval, a po jejím ukončení se zase vypíná normálně. Při ručním zamknutí zařízení zůstane obrazovka zamčená.

## Posunutí dnešních časů

Otevřete **Menu → Posunout časy** pro dnešní úpravu. Vyberte +5, +10, +15 nebo +30 minut, případně zadejte vlastní kladný nebo záporný počet minut. Náhled ukáže staré a nové časy. **Použít posun a zavřít** úpravu uloží. Křížek, Escape, klepnutí mimo okno nebo **Zrušit** náhled zahodí. **Vrátit poslední posun** obnoví předchozí časové posuny. **Obnovit původní časy** zruší všechny dnešní posuny i jejich vrácení. Obě akce zachovají zaškrtnutí i uložené oslavy.

Stejný posun dostanou všechny budoucí úkoly a všechny úkoly, které ještě nesplnily všechny přiřazené děti, včetně opožděných a právě probíhajících. Splněné minulé úkoly zůstávají na místě. Budoucí úkol se posune i při předčasném splnění. Posouvá se začátek i konec, takže délky a rozestupy mezi posouvanými úkoly zůstanou stejné. Historie splněných úkolů se může s posunutými řádky časově překrývat.

Časová osa, číselníky, odpočet, tlačítko Teď i oslavy používají dnešní upravené časy. Posun a možnost vrácení přežijí obnovení stránky, ale o místní půlnoci se spolu s denním pokrokem vynulují. Běžný plán a jeho JSON záloha zůstávají bez dnešních úprav. Posun přes hranici dne se nepoužije a zobrazí vysvětlení.

## Stejná oslava po celý den

Každé políčko dítěte a úkolu v daném profilu dostane vlastní náhodný denní výběr oslavy. Při opakování stejného typu uznání se přehraje stejný obrázek, varianta zprávy a uspořádání animace, i po obnovení stránky. O půlnoci se výběry smažou a další den přinese nové náhodné volby při prvním splnění.

Získané kladné oslavy a poháry lze později téhož dne znovu přehrát. Uložená želvička se přehodnotí při dalším zaškrtnutí. Pokud dítě splní dnešní upravený termín, dostane běžnou oslavu nebo pohár podle toho, zda tím dokončilo celý profil. Rodič může po dvousekundovém čekání zavřít želvičku, odškrtnout dostupné políčko, posunout zbývající časy a nechat dítě znovu zaškrtnout. Použije se stejný denní motiv a získané uznání přežije obnovení stránky. Pokud je úkol stále pozdě, přehraje se původní želví zpráva. Samotný posun zachová výběr do dalšího zaškrtnutí. Náhledy v Nastavení mají vlastní náhodné volby.

## Výběr ikon úkolů

V menu otevřete Úkoly a klepněte na obrázek úkolu. Výběr nabízí 82 vložených ikon v kategoriích Jídlo, Hygiena, Zdraví, Oblečení, Úklid, Škola, Zvířátka, Zábava a Odpočinek. Kategorie Vše ukáže celou nabídku a aktuální ikona je zvýrazněná. Výběr obrázku vrátí do rozpracovaného editoru Úkoly, kde zavření uloží platné změny a Zahodit změny je opustí. Zrušení výběru ponechá původní obrázek. Ikony fungují bez sítě ve Firefoxu 68 i v samostatném HTML.

Kategorie **Zdraví** obsahuje léky, náplast, vyšetření, teploměr, injekci, nemocnici, zdravotní péči, srdce, dýchání, roušku, berle a meditaci.

## Profily částí dne

Hamburger menu v horní liště přímo nabízí Ráno, Dopoledne, Poledne, Odpoledne a Večer. Profily jsou zobrazené jako dlaždice s obrázkem nad názvem: východ slunce, slunce za mráčkem, slunce, západ slunce a měsíc. Vybraná dlaždice má zelené zvýraznění. Vybraný profil je uvedený také v záhlaví Úkol. Přepínání je ruční a poslední výběr se pamatuje. Při prvním otevření obsahuje Večer šest ukázkových úkolů pro dvě děti, a to Večeři, Pyžámko, Vyčistit zoubky, Modlitbu, Na záchod a Do postýlky. Ostatní profily začínají prázdné a naplníte je tlačítkem Přidat úkoly. Ukázku upravíte nebo odstraníte v editoru Úkoly. Při dalších návštěvách se načte uložené nastavení rodiny. První nový úkol dostane čas 07:00, 09:00, 12:00, 15:00 nebo 18:00 podle profilu, ale časy nejsou nijak omezené na danou část dne.

Děti, barvy, formát času a zapnutí oslav jsou společné. Úkoly, přiřazení, denní zaškrtnutí, uložené oslavy, posuny, vrácení a obnovení původních časů patří pouze vybranému profilu. Závěrečná oslava znamená splnění všech úkolů právě tohoto profilu. Přes den se používají neutrální texty oslav, večer zůstávají večerní. O půlnoci denní stav vyprší i v profilech, které nebyly otevřené.

Nastavení ukládá společné děti a předvolby. Samostatné okno Úkoly ukládá úkoly vybraného profilu. Zahodit změny zruší všechny rozpracované úpravy včetně importu. Odebrání dítěte se promítne do všech profilů; pokud by některý úkol zůstal bez dítěte, uložení se zastaví s vysvětlením.

### Nové zálohy

Zálohovat všechny profily stáhne `daily-profiles.json`. Obsahuje `version: 3`, společné `kids`, `format`, `celebrations`, `activeProfileId` a objekt `profiles`. Ten má pevné položky `morning`, `forenoon`, `noon`, `afternoon`, `evening`, každou s polem `chores`. Záloha nezahrnuje denní pokrok ani posuny. Načtení připraví náhradu všech profilů a dětí; zavřením Nastavení ji potvrdíte, Zahodit změny ji zruší. Při použití zálohy se denní pokrok vynuluje.

Staré jednorázové plány ani zálohy se automaticky nepřevádějí. Pokud prohlížeč obsahuje stará nebo neplatná data, aplikace je nepřepíše a zobrazí zprávu s pokynem načíst převedenou zálohu. Samotné zavření Nastavení je v tomto případě neuloží. Původní testovací záloha se převede mimo aplikaci, až bude k dispozici.

## Horní lišta a menu

Horní lišta obsahuje pouze Teď, Celou obrazovku a hamburger menu. Menu přímo nabízí pět částí dne a dále Posunout časy, Úkoly a Nastavení. Úkoly obsahují pouze editor názvů, ikon, časů a přiřazení aktuálního profilu. Nastavení obsahuje děti s barvami, formát času, malé oslavy, jejich náhled a zálohy všech profilů. Oba editory ukládají platné změny při zavření; Zahodit změny je zruší. Neplatné údaje ponechají příslušné okno otevřené.

## Pohár za dokončení profilu

Pokud dítě dokončí všechny své úkoly nejpozději v nejpozdější koncový čas celého vybraného profilu, dostane pohár, i když poslední zaškrtnutý úkol měl vlastní termín dříve. Pořadí plnění nerozhoduje. Zohledňují se dnešní posunuté časy; přesně v koncový čas je ještě včas. U jednotlivých úkolů před dokončením všeho platí jejich vlastní termín. Dříve uložená běžná oslava nebo želvička nebrání získání závěrečného poháru. Získaný pohár se dá znovu přehrát, stejně jako ostatní denní oslavy.

## Kontextové hodiny úkolů

Číselník, přesné časy od–do a délka úkolu se zobrazují jen u právě probíhajících úkolů, nejbližšího budoucího nedokončeného úkolu a minulých úkolů, které ještě nesplnily všechny přiřazené děti. Pokud má více nejbližších úkolů stejný začátek, zobrazí se u všech. Předčasně splněný budoucí úkol se pro výběr dalšího přeskočí. Probíhající úkol má údaje viditelné až do svého konce i při splnění. U minulého nedokončeného úkolu je výseč světle červená. Časová osa vlevo zůstává dostupná vždy.

Údaje plynule přicházejí a mizí pomocí krátkého zeslabení a vodorovného posunu; jejich místo se pozvolna uvolní pro název úkolu. Výška řádků odpovídá skutečně zobrazenému obsahu a délce úkolu. Po skrytí hodin se zbytečné místo uvolní; delší texty, zaškrtávací políčka a viditelné hodiny mají vždy dost prostoru. Časová osa a čára Teď se přepočítají podle nových výšek. Při omezeném pohybu se animace vypne.

Řádky při změně obsahu plynule rostou a zmenšují se. Spolu s nimi se posouvají následující úkoly, značky časové osy a čára Teď. Ikona úkolu má vlastní levý sloupec s větším obrázkem; název je vpravo od ní. Při omezeném pohybu se změny provedou okamžitě.

## Rychlé zaškrtnutí

Zaškrtnutí aktualizuje přímo políčko, souhrn dítěte a stav daného řádku. Rozměry nezměněných úkolů se znovu neměří. Nejdříve se vykreslí potvrzené zaškrtnutí, pak se otevře oslava. Změna profilu, otevření dialogu nebo skrytí stránky zruší dosud neotevřenou oslavu.

Po zaškrtnutí nebo odškrtnutí se dané políčko na dvě sekundy uzamkne. Oslavu lze zavřít klepnutím nebo klávesou Escape až dvě sekundy po otevření. Opakované pokusy během čekání se ignorují a čekání neprodlužují.
