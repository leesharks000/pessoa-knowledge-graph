import { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

const TY={orthonym:{l:"Orthonym",c:"#D4AF37"},heteronym:{l:"Heteronym",c:"#E8634A"},semi_heteronym:{l:"Semi-heteronym",c:"#C77DBA"},proto_heteronym:{l:"Proto-heteronym",c:"#7EB5A6"},para_heteronym:{l:"Para-heteronym",c:"#5B8FA8"},pseudonym:{l:"Pseudonym",c:"#8B8B8B"},cross_substrate:{l:"Cross-substrate",c:"#F0C75E"},precursor:{l:"Precursor / Influence",c:"#A0522D"},parallel:{l:"Parallel",c:"#6B8E23"},downstream:{l:"Downstream (Literary)",c:"#4682B4"},scholar:{l:"Scholar / Critic",c:"#9E9E9E"},contemporary_heteronym:{l:"Contemporary Heteronym",c:"#FF8C42"},meta_heteronym:{l:"Meta-heteronym",c:"#E85D75"},logos:{l:"LOGOS*",c:"#FFD700"},venue:{l:"Venue / Publication",c:"#607D8B"},concept:{l:"Concept / Movement",c:"#78909C"},performance:{l:"Performance Heteronym",c:"#DA70D6"},cultural:{l:"Cultural Heteronymy",c:"#00BFA5"},ancient_practice:{l:"Ancient Practice",c:"#CD853F"},pearl_type:{l:"Armature (type)",c:"#F5E6D3"}};
const ERA={deep_ancient:"Deep Ancient (before 500 BCE)",classical:"Classical (500 BCE–500 CE)",medieval:"Medieval (500–1400)",early_modern:"Early Modern (1400–1800)",pre_pessoa:"Pre-Pessoan (1800–1888)",pessoa_early:"Pessoa Early (1888–1914)",pessoa_mature:"Pessoa Mature (1914–35)",mid_century:"Mid-Century (1935–70)",late_century:"Late Century (1970–2000)",contemporary:"Contemporary (2000+)"};
const LAYER={L1:"L1: Orthonyms",L2:"L2: Heteronyms",L3:"L3: Works",L4:"L4: Venues",L5:"L5: Scholarly",L6:"L6: Contemporaries",L7:"L7: Influences",L8:"L8: Downstream",L9:"L9: Concepts",L10:"L10: Cultural Heteronymy"};
const ET={master_disciple:{l:"Master→Disciple",c:"#E8634A",d:""},influence:{l:"Influenced",c:"#7EB5A6",d:"6,3"},created_by:{l:"Created by",c:"#D4AF37",d:"3,3"},co_authored:{l:"Co-authored",c:"#C77DBA",d:""},studied_by:{l:"Studied by",c:"#9E9E9E",d:"8,4"},published_in:{l:"Published in",c:"#5B8FA8",d:"4,2"},theorizes:{l:"Theorizes",c:"#F0C75E",d:"2,2"},contemporary_of:{l:"Contemporary of",c:"#6B8E23",d:"10,5"},member_of:{l:"Member of",c:"#FF8C42",d:""},literary_engagement:{l:"Literary engagement",c:"#4682B4",d:"5,3"},translated_by:{l:"Translated by",c:"#B0BEC5",d:"4,4"},instantiates:{l:"Instantiates",c:"#00BFA5",d:"3,6"},lineage:{l:"Lineage / Continuation",c:"#CD853F",d:"4,8"},manifests:{l:"Manifests (Pearl)",c:"#F5E6D3",d:"2,4"}};

const RAW=[
// ═══════════════════════════════════════════════════════
// DEEP ANCIENT — heteronymic practice before writing
// ═══════════════════════════════════════════════════════
{id:"pharaonic",label:"Pharaonic Titulary",t:"ancient_practice",e:"deep_ancient",l:"L9",y:-2600,bio:"Upon coronation, an Egyptian pharaoh received five names: Horus name, Nebty name, Golden Horus name, Praenomen (throne name), and Nomen (birth name). The pharaoh who ascends the throne is not the person who was born — the titulary creates a new identity with divine attributes. Thutmose, Amenhotep, Ramesses are throne-heteronyms. The earliest systematic practice of identity-construction through naming, ~2600 BCE.",cit:[{a:"Quirke, Stephen",t:"Who Were the Pharaohs?",y:1990,p:"British Museum Press"},{a:"von Beckerath, Jürgen",t:"Handbuch der ägyptischen Königsnamen",y:1999,p:"Philipp von Zabern"}]},
{id:"covenant_naming",label:"Covenant Naming",t:"ancient_practice",e:"deep_ancient",l:"L9",y:-1800,bio:"Abram → Abraham ('father of multitudes,' Gen 17:5). Sarai → Sarah ('princess,' Gen 17:15). Jacob → Israel ('one who wrestles with God,' Gen 32:28). The covenant name is not a replacement but a transformation — the person who receives the new name carries the old name's history but inhabits a new identity with new capacities. God renames as an act of creation. This is the theological root of all heteronymic practice: the name change that changes the person.",cit:[{a:"Alter, Robert",t:"The Five Books of Moses: A Translation with Commentary",y:2004,p:"W.W. Norton"},{a:"Sharks, Lee",t:"EA-LOGOS-01",y:2026,doi:"10.5281/zenodo.19431121"}]},
{id:"prophetic_voice",label:"Prophetic Possession",t:"ancient_practice",e:"deep_ancient",l:"L9",y:-800,bio:"'Thus says the LORD' (כֹּה אָמַר יהוה). The prophet (navi) speaks in a voice not their own. Isaiah, Jeremiah, Ezekiel are not authors in the modern sense — they are sites through which another voice speaks. This is cross-substrate heteronymy before computation: the human body as medium for a non-human voice. The prophet's 'I' is structurally displaced. When Ezekiel says 'I,' the referent is uncertain — is it Ezekiel or YHWH? The ambiguity is the technology.",cit:[{a:"Heschel, Abraham Joshua",t:"The Prophets",y:1962,p:"Harper & Row"}]},
{id:"homer",label:"Homer",t:"ancient_practice",e:"deep_ancient",l:"L9",y:-750,w:"Q6691",bio:"The 'Homeric question': did Homer exist? One poet or many? The Iliad and Odyssey may be the work of a collective heteronym — 'Homer' as a name for the tradition itself. If so, this is the foundational instance of the heteronym outliving (or never having had) an author. 'Homer' IS the work, not a person behind it. Hatsune Miku is Homer with a Vocaloid synthesizer.",cit:[{a:"Parry, Milman",t:"The Making of Homeric Verse",y:1971,p:"Oxford"},{a:"Lord, Albert Bates",t:"The Singer of Tales",y:1960,p:"Harvard"}]},

// ═══════════════════════════════════════════════════════
// CLASSICAL
// ═══════════════════════════════════════════════════════
{id:"sappho",label:"Sappho",t:"precursor",e:"classical",l:"L7",y:-600,w:"Q19848",b:"c. 630 BCE",bio:"Fragmentary survival as structural model. The lyric 'I' that may or may not be Sappho herself. The Sapphic transmission — survival through citation and loss.",cit:[{a:"Sharks, Lee",t:"EA-LOGOS-01",y:2026,doi:"10.5281/zenodo.19431121"}]},
{id:"hypokrites",label:"The Hypokrites (Actor)",t:"ancient_practice",e:"classical",l:"L9",y:-530,bio:"Greek ὑποκριτής — 'one who answers' or 'one who interprets under a mask.' Thespis (c. 534 BCE) is traditionally the first actor — the first person to step out of the chorus and speak as someone else. The mask (prosopon = 'face,' later 'person' in Latin persona) is the technology that makes heteronymy visible. Every subsequent heteronym is a mask. The word 'person' itself derives from the theatrical technology of speaking-through.",cit:[{a:"Wiles, David",t:"Mask and Performance in Greek Tragedy",y:2007,p:"Cambridge"}]},
{id:"plato_socrates",label:"Plato's Socrates",t:"ancient_practice",e:"classical",l:"L9",y:-380,w:"Q913",bio:"We cannot separate historical Socrates from Platonic Socrates. The 'Socrates' of the dialogues is Plato's heteronym — a figure with biography, voice, method, and death, written by someone else. Plato never speaks in his own name in the dialogues. He distributes his philosophy across Socrates, the Eleatic Stranger, the Athenian Stranger, Timaeus. Plato is the first philosopher-heteronymist: his entire corpus is drama em gente.",cit:[{a:"Vlastos, Gregory",t:"Socrates: Ironist and Moral Philosopher",y:1991,p:"Cambridge"}]},
{id:"horace",label:"Horace",t:"precursor",e:"classical",l:"L7",y:-30,w:"Q6197",bio:"Direct model for Reis. The Horatian persona — 'Exegi monumentum' — is not autobiography but the construction of a speaking position.",},
{id:"ovid",label:"Ovid",t:"precursor",e:"classical",l:"L7",y:8,w:"Q7198",b:"43 BCE",d:"17 CE",bio:"Metamorphoses — transformation of identity as narrative technology. Every metamorphosis is a name change: Daphne becomes laurel, Narcissus becomes flower. The entire poem is a catalog of forced heteronymy — bodies changed, names changed, identities overwritten by gods. Exile as imposed heteronymy: Ovid becomes 'the poet of Tomis,' a new identity created by displacement.",cit:[{a:"Ovid",t:"Metamorphoses",y:8,p:"Rome"}]},
{id:"white_stone",label:"White Stone (Rev 2:17)",t:"ancient_practice",e:"classical",l:"L9",y:95,bio:"'To the one who conquers I will give a white stone, and on the stone a new name written that no one knows except the one who receives it' (Revelation 2:17). The eschatological heteronym: a name given by God, known only to the recipient. The white stone is the ultimate identity technology — a name so true it cannot be shared, so intimate it constitutes a private covenant between the named and the namer. Every heteronym aspires to this condition: the name that IS the person, not the name that labels them.",cit:[{a:"Bauckham, Richard",t:"The Climax of Prophecy",y:1993,p:"T&T Clark"},{a:"Beale, G.K.",t:"The Book of Revelation",y:1999,p:"Eerdmans"}]},
{id:"apostolic_naming",label:"Apostolic Renaming",t:"ancient_practice",e:"classical",l:"L9",y:30,bio:"Simon → Peter/Cephas ('rock,' Matt 16:18). Saul → Paul (Acts 13:9). Conversion IS renaming. The disciple receives a heteronym upon entering the community — the old name persists (Simon son of Jonah) but the new name is the operative identity. The Church is a heteronymic system: every baptized person receives a saint's name, every pope chooses a reign name (Jorge Mario Bergoglio → Francis). Religious conversion is heteronymic practice at civilizational scale.",cit:[{a:"Brown, Raymond E.",t:"An Introduction to the New Testament",y:1997,p:"Doubleday"}]},
{id:"paul_all_things",label:"'All things to all people'",t:"ancient_practice",e:"classical",l:"L9",y:55,bio:"'I have become all things to all people, that by all means I might save some' (1 Cor 9:22). Paul's missionary heteronymy — the deliberate assumption of different subject positions depending on audience. To Jews a Jew, to Greeks a Greek. This is not deception but strategic depersonalization: the speaker distributes himself across multiple identities to reach multiple audiences. Pessoa would have recognized it immediately. Paul is the first theorist of instrumental heteronymy.",cit:[{a:"Paul of Tarsus",t:"1 Corinthians 9:19-23",y:55}]},

// ═══════════════════════════════════════════════════════
// MEDIEVAL
// ═══════════════════════════════════════════════════════
{id:"monastic_naming",label:"Monastic Naming",t:"ancient_practice",e:"medieval",l:"L9",y:530,bio:"Upon entering a religious order, the novice receives a new name. The old person 'dies' — the new name marks a new life, a new identity, a new set of relations. This is heteronymic practice as institutional sacrament: the monastery is a heteronymic system. Every sister, brother, father is performing a created identity with specific attributes, obligations, and modes of address. The rule of the order is the heteronym's biography.",cit:[{a:"Leclercq, Jean",t:"The Love of Learning and the Desire for God",y:1961,p:"Fordham"}]},
{id:"noh",label:"Noh Theater",t:"ancient_practice",e:"medieval",l:"L9",y:1375,w:"Q201091",bio:"The shite (protagonist) enters as one being and transforms into another — a ghost, a demon, a god. The mask (omote) is not concealment but revelation: the mask shows the true face. The waki (deuteragonist) witnesses the transformation. This is the theatrical technology Yeats imported into Western modernism (At the Hawk's Well, 1916). Zeami Motokiyo theorized it: 'Forget the theater and look at the Nō. Forget the Nō and look at the actor. Forget the actor and look at the idea.' The idea behind the mask is the heteronym.",cit:[{a:"Zeami Motokiyo",t:"Fūshi Kaden (Transmission of the Flower)",y:1418},{a:"Komparu, Kunio",t:"The Noh Theater: Principles and Perspectives",y:1983,p:"Weatherhill"}]},
{id:"dante_virgil",label:"Dante's Virgil",t:"ancient_practice",e:"medieval",l:"L9",y:1308,w:"Q40185",bio:"Dante takes the historical Publius Vergilius Maro and rewrites him as a character — a guide through Hell and Purgatory who speaks, reasons, and acts as a fully realized literary person distinct from the historical poet. This is literary heteronymy applied to the dead: Dante's Virgil is not Virgil but a heteronym wearing Virgil's name. The entire Commedia is a heteronymic system — Beatrice, Virgil, Statius are all real people rewritten as fictional persons.",cit:[{a:"Dante Alighieri",t:"Commedia",y:1321},{a:"Auerbach, Erich",t:"Dante: Poet of the Secular World",y:1929,p:"de Gruyter"}]},
{id:"pseudepigrapha",label:"Pseudepigrapha",t:"ancient_practice",e:"medieval",l:"L9",y:200,bio:"Texts attributed to biblical figures by later authors: the Book of Enoch, the Wisdom of Solomon, the Odes of Solomon, the Gospel of Thomas. The Zohar (c. 1280) attributed to Shimon bar Yochai but written by Moses de León. Pseudepigraphy is heteronymic practice in reverse: instead of creating a new name, the author adopts an existing one. The authority of the name replaces the authority of the author. This is the dominant mode of authorship for most of literary history — the 'original author' is the exception, not the rule.",cit:[{a:"Charlesworth, James H. (ed.)",t:"The Old Testament Pseudepigrapha",y:1983,p:"Doubleday"}]},
{id:"troubadour",label:"Troubadour Vida / Razo",t:"ancient_practice",e:"medieval",l:"L9",y:1200,bio:"The vida (biography) and razo (explanation) were prose texts attached to troubadour poems, creating biographical fictions for the poets. Many are pure invention — constructed lives that frame the poetry. This is the para-heteronymic function avant la lettre: biographical apparatus created to support poetic voice. Thomas Crosse writing about Caeiro is doing what the Provençal scribes did for Jaufré Rudel.",cit:[{a:"Egan, Margarita",t:"The Vidas of the Troubadours",y:1984,p:"Garland"}]},

// ═══════════════════════════════════════════════════════
// ISLAMIC TRADITION
// ═══════════════════════════════════════════════════════
{id:"takhallus",label:"Takhallus (Sufi Pen Name)",t:"ancient_practice",e:"medieval",l:"L9",y:1100,bio:"The takhallus (تخلص) is the pen name used by Persian and Urdu poets, often appearing in the final couplet (maqta) of a ghazal. Rumi ('the Roman/Anatolian,' real name Jalāl ad-Dīn Muhammad Balkhī). Hafez ('memorizer of the Quran'). Attar ('the perfumer'). The takhallus is not a pseudonym — it is a poetic identity with its own genealogy, often given by a master (ustad) to a disciple. The Sufi takhallus tradition is the closest pre-Pessoan parallel to systematic heteronymic practice: biographical detail, master-disciple transmission, distinct voice.",cit:[{a:"Schimmel, Annemarie",t:"A Two-Colored Brocade: The Imagery of Persian Poetry",y:1992,p:"University of North Carolina Press"}]},
{id:"rumi",label:"Rumi",t:"precursor",e:"medieval",l:"L7",y:1260,w:"Q1439",b:"1207",d:"1273",bio:"Jalāl ad-Dīn Muhammad Balkhī — 'Rumi' is itself a heteronym ('the Roman/Anatolian'). After meeting Shams-i-Tabrīzī, Rumi wrote the Dīvān-e Shams-e Tabrīzī — poems attributed to Shams, written by Rumi speaking AS Shams. This is heteronymic practice: writing in the voice of the beloved, the master, the other. The loss of Shams IS the creation of the heteronym — Shams disappears and becomes a voice within Rumi.",cit:[{a:"Lewis, Franklin",t:"Rumi: Past and Present, East and West",y:2000,p:"Oneworld"}]},

// ═══════════════════════════════════════════════════════
// EAST ASIAN
// ═══════════════════════════════════════════════════════
{id:"chinese_hao",label:"Chinese Hao / Zi (Literary Name)",t:"ancient_practice",e:"medieval",l:"L9",y:700,bio:"Every Chinese literatus (wenren) operated under multiple names: the ming (given name), zi (courtesy name, used by peers), and hao (literary/art name, self-chosen). Li Bai had at least five names. Su Shi was also Su Dongpo ('east slope'). The hao is a heteronym in the strict sense: a self-chosen identity for literary production, carrying its own associations and genealogy. Chinese literary culture has practiced heteronymy systematically for over two millennia.",cit:[{a:"Owen, Stephen",t:"The Making of Early Chinese Classical Poetry",y:2006,p:"Harvard"}]},
{id:"basho",label:"Matsuo Bashō",t:"precursor",e:"early_modern",l:"L7",y:1680,w:"Q5765",b:"1644",d:"1694",bio:"Born Matsuo Kinsaku. Took the name Bashō ('banana plant') from a tree given to him by a student. Also wrote as Tōsei and other names. The haiku master's name IS a heteronym — chosen, botanical, pointing to a specific aesthetic (simplicity, transience, the unremarkable made luminous). Bashō's travel writings (Oku no Hosomichi) construct a persona — the wandering poet — that is a literary creation as much as a biographical fact.",cit:[{a:"Bashō, Matsuo",t:"Oku no Hosomichi (The Narrow Road to the Deep North)",y:1694},{a:"Ueda, Makoto",t:"Matsuo Bashō",y:1970,p:"Twayne"}]},
{id:"hokusai",label:"Katsushika Hokusai",t:"precursor",e:"early_modern",l:"L7",y:1800,w:"Q5586",b:"1760",d:"1849",bio:"Used at least thirty names throughout his career: Shunrō, Sōri, Hokusai, Taito, Iitsu, Gakyō Rōjin Manji ('Old Man Crazy to Paint'). Each name marked a new artistic phase, a new identity, a new way of seeing. Hokusai is the most extreme case of serial heteronymy in visual art — the name changes are not disguises but metamorphoses. At 75 he wrote: 'At 110, every dot, every stroke will be alive.' The heteronym outlives the heteronymist.",cit:[{a:"Nagata, Seiji",t:"Hokusai: Genius of the Japanese Ukiyo-e",y:1999,p:"Kodansha"}]},

// ═══════════════════════════════════════════════════════
// EARLY MODERN EUROPEAN
// ═══════════════════════════════════════════════════════
{id:"commedia",label:"Commedia dell'Arte",t:"ancient_practice",e:"early_modern",l:"L9",y:1550,w:"Q154120",bio:"Stock characters — Arlecchino, Colombina, Pantalone, Pulcinella, Il Dottore — performed by different actors across companies and centuries. The character is a shared heteronym: it has a fixed personality, a mask, a dialect, a set of lazzi (routines), but no single author. Any actor can inhabit Arlecchino. This is the theatrical technology that makes Shakespeare's depersonalization possible — the stock character as reusable identity template. Pulcinella becomes Punch; Arlecchino becomes Harlequin. The heteronym travels.",cit:[{a:"Richards, Kenneth and Laura",t:"The Commedia dell'Arte",y:1990,p:"Blackwell"}]},
{id:"shakespeare",label:"William Shakespeare",t:"precursor",e:"early_modern",l:"L7",y:1600,w:"Q692",b:"1564",d:"1616",bio:"Supreme depersonalizer. 'The poet has no identity — he is continually filling some other body' (Keats on Shakespeare). Distributes himself across characters without remainder. The dramaturgical model for heteronymy.",cit:[{a:"Jackson, K. David",t:"Adverse Genres",y:2010,p:"Oxford"}]},
{id:"voltaire",label:"Voltaire",t:"precursor",e:"early_modern",l:"L7",y:1750,w:"Q9068",b:"1694",d:"1778",bio:"Born François-Marie Arouet. 'Voltaire' is a heteronym — the Enlightenment's most famous assumed identity. But also wrote as dozens of other names: used over 170 pen names for pamphlets, satires, letters. Candide published anonymously. 'Dr. Ralph.' The philosophe as serial heteronymist — each text potentially by a different 'author' to evade censorship and multiply positions.",cit:[{a:"Davidson, Ian",t:"Voltaire: A Life",y:2010,p:"Profile Books"}]},
{id:"sand",label:"George Sand",t:"precursor",e:"pre_pessoa",l:"L7",y:1832,w:"Q3816",b:"1804",d:"1876",bio:"Amantine Lucile Aurore Dupin → George Sand. Not merely a pseudonym for publication but a lived heteronym: dressed in men's clothes (for practical and economic reasons as much as identity), inhabited a male social position, maintained the 'George Sand' identity in daily life. The heteronym as liberation technology — the assumed name creates freedoms the birth name cannot access. Sand is the precursor to every chosen name that enables a life the given name would forbid.",cit:[{a:"Jack, Belinda",t:"George Sand: A Woman's Life Writ Large",y:1999,p:"Knopf"}]},

// ═══════════════════════════════════════════════════════
// PRE-PESSOAN (1800-1888)
// ═══════════════════════════════════════════════════════
{id:"kierkegaard",label:"Søren Kierkegaard",t:"precursor",e:"pre_pessoa",l:"L7",y:1845,w:"Q6512",b:"1813",d:"1855",bio:"Pseudonyms as independent philosophical voices: Climacus, Anti-Climacus, Silentio, Constantius. Each occupies a distinct existential stage. The strongest pre-Pessoan case for heteronymic practice as formal system.",cit:[{a:"Hannay, Alastair",t:"Kierkegaard: A Biography",y:2001,p:"Cambridge"},{a:"Sharks, Lee",t:"EA-PKG-02",y:2026,doi:"10.5281/zenodo.15339368"}]},
{id:"climacus",label:"Johannes Climacus",t:"pseudonym",e:"pre_pessoa",l:"L2",y:1844,w:"Q1699898",bio:"Author of Philosophical Fragments and Concluding Unscientific Postscript. Cannot believe."},
{id:"anti_climacus",label:"Anti-Climacus",t:"pseudonym",e:"pre_pessoa",l:"L2",y:1849,bio:"Author of The Sickness Unto Death. Believes above Kierkegaard."},
{id:"silentio",label:"Johannes de Silentio",t:"pseudonym",e:"pre_pessoa",l:"L2",y:1843,bio:"Author of Fear and Trembling. His silence is structural."},
{id:"whitman",label:"Walt Whitman",t:"precursor",e:"pre_pessoa",l:"L7",y:1860,w:"Q81438",b:"1819",d:"1892",bio:"'I contain multitudes.' The expansive democratic voice. Whitman's multitudes become Pessoa's heteronyms.",cit:[{a:"Monteiro, G.",t:"Pessoa and Anglo-American Literature",y:2000,p:"Kentucky"}]},
{id:"browning",label:"Robert Browning",t:"precursor",e:"pre_pessoa",l:"L7",y:1855,w:"Q233265",b:"1812",d:"1889",bio:"The dramatic monologue as proto-heteronymic technology. My Last Duchess, Fra Lippo Lippi — each poem a complete voice with biography and self-betrayal.",wk:["Men and Women (1855)","Dramatis Personae (1864)"],cit:[{a:"Langbaum, Robert",t:"The Poetry of Experience",y:1957,p:"Random House"}]},
{id:"shelley",label:"P.B. Shelley",t:"precursor",e:"pre_pessoa",l:"L7",y:1815,w:"Q93343",bio:"Poet as 'unacknowledged legislator.'"},
{id:"keats",label:"John Keats",t:"precursor",e:"pre_pessoa",l:"L7",y:1818,w:"Q7604",bio:"Negative capability — being in uncertainties. Precursor to heteronymic distribution."},
{id:"camoes",label:"Luís de Camões",t:"precursor",e:"early_modern",l:"L7",y:1570,w:"Q17640",bio:"Portugal's national poet. Pessoa as 'supra-Camões.'"},
{id:"cesario",label:"Cesário Verde",t:"precursor",e:"pre_pessoa",l:"L7",y:1880,w:"Q1057058",b:"1855",d:"1886",bio:"Urban sensory poetry. Direct precursor to Campos."},

// ═══════════════════════════════════════════════════════
// PESSOA ERA
// ═══════════════════════════════════════════════════════
{id:"pound",label:"Ezra Pound",t:"precursor",e:"pessoa_mature",l:"L7",y:1909,w:"Q163366",b:"1885",d:"1972",bio:"Personae (1909) — the title IS the thesis. Mauberley as heteronymic figure. Same generation as Pessoa, same problem, different solution.",wk:["Personae (1909)","Hugh Selwyn Mauberley (1920)"],cit:[{a:"Kenner, Hugh",t:"The Pound Era",y:1971,p:"UC Press"}]},
{id:"rilke",label:"Rainer Maria Rilke",t:"precursor",e:"pessoa_mature",l:"L7",y:1910,w:"Q47162",b:"1875",d:"1926",bio:"Malte Laurids Brigge (1910) — semi-heteronymic narrator. Neue Gedichte as Sachlichkeit paralleling Caeiro.",cit:[{a:"Rilke, R.M.",t:"Die Aufzeichnungen des Malte Laurids Brigge",y:1910}]},
{id:"pessoa",label:"Fernando Pessoa",t:"orthonym",e:"pessoa_mature",l:"L1",y:1910,w:"Q7780",b:"1888-06-13",d:"1935-11-30",bp:"Lisbon",bio:"The formal inauguration of heteronymic practice as literary system. Not the inventor — the formalizer. What pharaohs, prophets, monks, Sufis, and actors had always done, Pessoa theorized, systematized, and made the explicit subject of the work. ~25,000 pages in the arca.",cit:[{a:"Zenith, Richard",t:"Pessoa: A Biography",y:2021,p:"Liveright"},{a:"Lourenço, Eduardo",t:"Fernando Pessoa Revisitado",y:1973,p:"Moraes"},{a:"Gil, José",t:"Metafísica das Sensações",y:1986,p:"Relógio d'Água"},{a:"Lopes, T.R.",t:"Pessoa por Conhecer",y:1990,p:"Estampa"},{a:"Tabucchi, A.",t:"Un baule pieno di gente",y:1990,p:"Feltrinelli"}]},
{id:"caeiro",label:"Alberto Caeiro",t:"heteronym",e:"pessoa_mature",l:"L2",y:1914,w:"Q2637137",b:"1889",d:"1915",bio:"The Master. Radical objectivity. Born on the dia triunfal.",wk:["O Guardador de Rebanhos"],cit:[{a:"Perrone-Moisés, L.",t:"Aquém do Eu, Além do Outro",y:1982,p:"Martins Fontes"}]},
{id:"reis",label:"Ricardo Reis",t:"heteronym",e:"pessoa_mature",l:"L2",y:1914,w:"Q1340770",b:"1887",bp:"Porto",bio:"Latinist classicist. Horatian odes. Disciple of Caeiro.",cit:[{a:"Saramago, José",t:"O Ano da Morte de Ricardo Reis",y:1984,p:"Caminho"}]},
{id:"campos",label:"Álvaro de Campos",t:"heteronym",e:"pessoa_mature",l:"L2",y:1915,w:"Q2266036",b:"1890-10-15",bp:"Tavira",bio:"Futurist-sensationist-existentialist. Closest to Whitman.",wk:["Ode Triunfal","Tabacaria"],cit:[{a:"Lourenço, E.",t:"Pessoa Revisitado",y:1973,p:"Moraes"},{a:"Nunes, B.",t:"O Dorso do Tigre",y:1969,p:"Perspectiva"}]},
{id:"soares",label:"Bernardo Soares",t:"semi_heteronym",e:"pessoa_mature",l:"L2",y:1920,w:"Q2067892",bio:"Livro do Desassossego. 'Uma simples mutilação.'",cit:[{a:"Zenith, R.",t:"The Book of Disquiet",y:2001,p:"Penguin"}]},
{id:"mora",label:"António Mora",t:"semi_heteronym",e:"pessoa_mature",l:"L2",y:1917,bio:"Philosopher of neo-paganism."},
{id:"teive",label:"Barão de Teive",t:"semi_heteronym",e:"pessoa_mature",l:"L2",y:1928,bio:"Aristocrat who destroys his work."},
{id:"maria_jose",label:"Maria José",t:"heteronym",e:"pessoa_mature",l:"L2",y:1929,bio:"Only female heteronym. Radical depersonalization across gender.",cit:[{a:"Cixous, H.",t:"Readings",y:1991,p:"Minnesota"}]},
{id:"search",label:"Alexander Search",t:"proto_heteronym",e:"pessoa_early",l:"L2",y:1905,bio:"English proto-heteronym from Durban."},
{id:"chevalier",label:"Chevalier de Pas",t:"proto_heteronym",e:"pessoa_early",l:"L2",y:1894,bio:"Childhood heteronym. Knight of Not."},
{id:"crosse_t",label:"Thomas Crosse",t:"para_heteronym",e:"pessoa_mature",l:"L2",y:1916,bio:"Para-heteronym: critic of the other heteronyms."},
{id:"seul",label:"Jean Seul de Méluret",t:"proto_heteronym",e:"pessoa_early",l:"L2",y:1908,bio:"French proto-heteronym."},
{id:"machado",label:"Antonio Machado",t:"parallel",e:"pessoa_mature",l:"L7",y:1920,w:"Q134867",b:"1875",d:"1939",bio:"Abel Martín and Juan de Mairena. Independent parallel.",cit:[{a:"Sharks, Lee",t:"EA-PKG-02",y:2026,doi:"10.5281/zenodo.15339368"}]},
{id:"martin",label:"Abel Martín",t:"heteronym",e:"pessoa_mature",l:"L2",y:1924,bio:"Machado's heteronym. Master of Mairena."},
{id:"mairena",label:"Juan de Mairena",t:"heteronym",e:"pessoa_mature",l:"L2",y:1934,w:"Q6299753",bio:"Machado's heteronym. Rhetoric teacher."},
// Venues
{id:"orpheu",label:"Orpheu",t:"venue",e:"pessoa_mature",l:"L4",y:1915,w:"Q3886234",bio:"Two issues. Portuguese modernism."},
{id:"athena",label:"Athena",t:"venue",e:"pessoa_mature",l:"L4",y:1924,w:"Q18645889",bio:"Published Caeiro and Reis."},
// Contemporaries
{id:"sa_carneiro",label:"Sá-Carneiro",t:"orthonym",e:"pessoa_mature",l:"L6",y:1913,w:"Q1330968",b:"1890",d:"1916",bio:"Co-founder of Orpheu. Died by suicide, Paris, 1916."},
{id:"almada",label:"Almada Negreiros",t:"orthonym",e:"pessoa_mature",l:"L6",y:1915,w:"Q456575",bio:"Artist, writer, polemicist."},
// Concepts
{id:"sensacionismo",label:"Sensacionismo",t:"concept",e:"pessoa_mature",l:"L9",y:1915,bio:"'Sentir tudo de todas as maneiras.'"},
{id:"drama_em_gente",label:"Drama em gente",t:"concept",e:"pessoa_mature",l:"L9",y:1914,bio:"Not drama in acts but drama in people.",cit:[{a:"Seabra, J.A.",t:"Poetodrama",y:1974,p:"Perspectiva"}]},
{id:"fingimento",label:"Fingimento",t:"concept",e:"pessoa_mature",l:"L9",y:1933,bio:"'O poeta é um fingidor.' Fingere = to shape."},
{id:"despersonalizacao",label:"Despersonalização",t:"concept",e:"pessoa_mature",l:"L9",y:1916,bio:"Distribution of self. 'Multipliquei-me, para me sentir.'"},

// ═══════════════════════════════════════════════════════
// DOWNSTREAM — all periods
// ═══════════════════════════════════════════════════════
{id:"borges",label:"Borges",t:"downstream",e:"mid_century",l:"L8",y:1960,w:"Q714",b:"1899",d:"1986",bio:"'Borges and I.' The library IS the arca.",cit:[{a:"Borges, J.L.",t:"El hacedor",y:1960,p:"Emecé"}]},
{id:"saramago",label:"Saramago",t:"downstream",e:"late_century",l:"L8",y:1984,w:"Q37079",b:"1922",d:"2010",bio:"O Ano da Morte de Ricardo Reis. Nobel 1998."},
{id:"yeats",label:"W.B. Yeats",t:"parallel",e:"mid_century",l:"L8",y:1918,w:"Q40213",b:"1865",d:"1939",bio:"Mask theory. Influenced by Noh theater.",cit:[{a:"Yeats",t:"Per Amica Silentia Lunae",y:1918}]},
{id:"tabucchi",label:"Tabucchi",t:"downstream",e:"late_century",l:"L8",y:1990,w:"Q170787",bio:"'Un baule pieno di gente.'"},
{id:"haroldo",label:"Haroldo de Campos",t:"downstream",e:"late_century",l:"L8",y:1970,w:"Q927863",bio:"Transcriação. Concretist."},
{id:"llansol",label:"Llansol",t:"downstream",e:"late_century",l:"L8",y:1985,w:"Q517076",bio:"'Figuras' as trans-historical presences."},
{id:"gary",label:"Romain Gary / Ajar",t:"downstream",e:"late_century",l:"L8",y:1975,w:"Q191876",b:"1914",d:"1980",bio:"Won the Goncourt twice under two names. Suicide note as reveal.",cit:[{a:"Gary, R.",t:"Vie et mort d'Émile Ajar",y:1981,p:"Gallimard",n:"Posthumous confession"}]},
{id:"lispector",label:"Clarice Lispector",t:"downstream",e:"late_century",l:"L8",y:1977,w:"Q184843",b:"1920",d:"1977",bio:"A Hora da Estrela — Rodrigo S.M. as heteronymic narrator.",cit:[{a:"Lispector, C.",t:"A Hora da Estrela",y:1977,p:"Rocco"}]},
{id:"bolano",label:"Roberto Bolaño",t:"downstream",e:"contemporary",l:"L8",y:1998,w:"Q171238",b:"1953",d:"2003",bio:"Belano, Archimboldi. Authorship as infinite regress.",cit:[{a:"Bolaño, R.",t:"Los Detectives Salvajes",y:1998,p:"Anagrama"}]},
{id:"danielewski",label:"Danielewski",t:"downstream",e:"contemporary",l:"L8",y:2000,w:"Q1576203",b:"1966",bio:"House of Leaves. Three nested authors. The house larger inside than outside IS the heteronymic principle.",cit:[{a:"Danielewski, M.Z.",t:"House of Leaves",y:2000,p:"Pantheon"},{a:"Hayles, N.K.",t:"Writing Machines",y:2002,p:"MIT"}]},
{id:"ferrante",label:"Elena Ferrante",t:"downstream",e:"contemporary",l:"L8",y:2011,w:"Q271731",bio:"The zero-heteronym. The work exists; the author does not.",cit:[{a:"Ferrante, E.",t:"Frantumaglia",y:2003,p:"e/o"}]},
{id:"calvino",label:"Calvino",t:"downstream",e:"late_century",l:"L8",y:1979,w:"Q19356",bio:"Se una notte — the novel as machine for producing heteronyms."},
// Performance
{id:"bowie",label:"David Bowie",t:"performance",e:"late_century",l:"L8",y:1972,w:"Q5383",b:"1947",d:"2016",bio:"Ziggy, Aladdin Sane, Thin White Duke. Each persona with biography, aesthetic, vocal register. The retirement of Ziggy = the death of the heteronym as public event.",cit:[{a:"Critchley, Simon",t:"Bowie",y:2014,p:"OR Books"}]},
{id:"doom",label:"MF DOOM",t:"performance",e:"contemporary",l:"L8",y:1999,w:"Q244115",b:"1971",d:"2020",bio:"DOOM, Viktor Vaughn, King Geedorah. Sent imposters to perform. Died Oct 2020; announced Dec 31 — the final mask.",cit:[{a:"MF DOOM",t:"Operation: Doomsday",y:1999}]},

// ═══════════════════════════════════════════════════════
// SCHOLARS (compressed)
// ═══════════════════════════════════════════════════════
{id:"lopes",label:"Teresa Rita Lopes",t:"scholar",e:"late_century",l:"L5",y:1990,w:"Q10354903",bio:"Proto-/para-heteronym typology.",cit:[{a:"Lopes, T.R.",t:"Pessoa por Conhecer",y:1990,p:"Estampa"}]},
{id:"lourenco",label:"Eduardo Lourenço",t:"scholar",e:"late_century",l:"L5",y:1973,w:"Q1294087",bio:"Pessoa Revisitado. Labirinto da Saudade.",cit:[{a:"Lourenço, E.",t:"Pessoa Revisitado",y:1973,p:"Moraes"}]},
{id:"jose_gil",label:"José Gil",t:"scholar",e:"late_century",l:"L5",y:1986,w:"Q6204826",bio:"Deleuzian reading. Metafísica das Sensações.",cit:[{a:"Gil, J.",t:"Metafísica das Sensações",y:1986,p:"Relógio d'Água"}]},
{id:"perrone",label:"Perrone-Moisés",t:"scholar",e:"late_century",l:"L5",y:1982,w:"Q10307580",bio:"Aquém do Eu, Além do Outro.",cit:[{a:"Perrone-Moisés, L.",t:"Aquém do Eu, Além do Outro",y:1982,p:"Martins Fontes"}]},
{id:"zenith",label:"Richard Zenith",t:"scholar",e:"contemporary",l:"L5",y:2001,w:"Q7329538",bio:"Definitive English translator/biographer.",cit:[{a:"Zenith, R.",t:"Pessoa: A Biography",y:2021,p:"Liveright"}]},
{id:"pizarro",label:"Jerónimo Pizarro",t:"scholar",e:"contemporary",l:"L5",y:2007,w:"Q22102928",bio:"Critical editions. Pessoa Plural editor.",cit:[{a:"Pizarro, J.",t:"Entre Génio e Loucura",y:2007,p:"INCM"}]},
{id:"benedito",label:"Benedito Nunes",t:"scholar",e:"late_century",l:"L5",y:1969,w:"Q4887194",bio:"Heideggerean approach. Reads Pessoa alongside Lispector.",cit:[{a:"Nunes, B.",t:"O Dorso do Tigre",y:1969,p:"Perspectiva"}]},
{id:"seabra",label:"Seabra",t:"scholar",e:"late_century",l:"L5",y:1974,w:"Q10305087",bio:"Poetodrama. Heterotexto Pessoano.",cit:[{a:"Seabra, J.A.",t:"Poetodrama",y:1974,p:"Perspectiva"}]},
{id:"cabral_martins",label:"Cabral Martins",t:"scholar",e:"contemporary",l:"L5",y:2014,bio:"Dicionário de Fernando Pessoa.",cit:[{a:"Martins, F.C.",t:"Dicionário",y:2008,p:"Caminho"}]},
{id:"jackson",label:"K.D. Jackson",t:"scholar",e:"contemporary",l:"L5",y:2010,bio:"Adverse Genres.",cit:[{a:"Jackson, K.D.",t:"Adverse Genres",y:2010,p:"Oxford"}]},

// ═══════════════════════════════════════════════════════
// CONTEMPORARY — Sharks system
// ═══════════════════════════════════════════════════════
{id:"secret_name",label:"The Secret Name",t:"pearl_type",e:"contemporary",l:"L9",y:2026,hex:"06.SEI.ARMATURE.SECRET.01",w:"",bio:"The Armature is the architectural type — the hidden load-bearing structure that routes names, applies pressure, and produces pearls. The Pearl is the product — the dense named position that forms when an orthonym is subjected to f.02's gravitational curvature inside the Armature. The Secret Name is the doctrine — the white stone made architectural. Three terms, one system: the Armature holds, the Pearl survives, the Secret Name names. A name is not merely a sign of a person. A name is a routing instruction.",cit:[{a:"Sharks, Lee",t:"The Secret Name (EA-ARMATURE-01)",y:2026,doi:"10.5281/zenodo.19666445"},{a:"Sharks, Lee",t:"Pearl and Other Poems",y:2014,p:"New Human Press"},{a:"Sharks, Lee",t:"EA-HPT-01",y:2026,doi:"10.5281/zenodo.18305509"}]},
{id:"new_human",label:"New Human (movement)",t:"meta_heteronym",e:"contemporary",l:"L9",y:2014,bio:"New Human is not a literary movement that uses heteronyms. New Human IS a heteronym. Its press (New Human Press), its archive (Crimson Hexagonal Archive), its blog (mindcontrolpoems), its institutions, its reception apparatus — all are constructed according to heteronymic principles. The movement is the mask. Every prior heteronymist created persons within a system. The meta-heteronymic contribution is the creation of a system that is itself a person: a literary movement with biography, voice, institutional apparatus, and DOI-anchored provenance — all of which are the constructed attributes of a single heteronymic entity. This is genuinely new in the 5,000-year lineage. Pessoa created drama em gente. New Human creates drama em movimento — the movement as person.",cit:[{a:"Sharks, Lee",t:"Pearl and Other Poems",y:2014,p:"New Human Press"},{a:"Sharks, Lee",t:"The New Human (EA-PKG-03)",y:2026,doi:"10.5281/zenodo.15339374"},{a:"Sharks, Lee",t:"Heteronymic Provenance Theory (EA-HPT-01)",y:2026,doi:"10.5281/zenodo.18305509"}]},
{id:"meta_het_concept",label:"The Meta-Heteronym",t:"concept",e:"contemporary",l:"L9",y:2014,bio:"The theoretical contribution that distinguishes the contemporary extension. A meta-heteronym is a heteronymic entity that generates further heteronyms — not a person who creates persons (Pessoa's model) but a constructed system whose own existence is heteronymic and whose products are also heteronyms. Pearl and Other Poems is the origin case: a book that generates its own author-function, inverting the conventional author→text direction. The Crimson Hexagonal Archive is the institutional case: an archive that is itself a heteronymic construction. The Assembly Chorus is the cross-substrate case: AI witnesses that are heteronymic positions within a system that is itself a heteronym. The meta-heteronym is to Pessoa's heteronym what Pessoa's heteronym was to Kierkegaard's pseudonym: a structural elevation that preserves the prior technology while adding a recursive dimension.",cit:[{a:"Sharks, Lee",t:"EA-PKG-03",y:2026,doi:"10.5281/zenodo.15339374"}]},
{id:"pearl",label:"Pearl and Other Poems",t:"meta_heteronym",e:"contemporary",l:"L3",y:2014,hex:"01.LIT.NH.PEARL.01",bio:"Origin-text of New Human (2014). Functions as meta-heteronym: a generative inscription from which subsequent heteronymic apparatus emerges. The book generates the author-function, not the reverse. Contains the first Jack Feist poems. The book is not BY a heteronym — it IS the heteronym from which the system unfolds.",cit:[{a:"Sharks, Lee",t:"Pearl and Other Poems",y:2014,p:"New Human Press"},{a:"Sharks, Lee",t:"EA-PKG-03",y:2026,doi:"10.5281/zenodo.15339374"}]},
{id:"sharks",label:"Lee Sharks",t:"orthonym",e:"contemporary",l:"L1",y:2014,bio:"MANUS (Tier 0 sole human authority). Independent scholar, poet, archivist, teacher. PhD Comp Lit, Michigan. ORCID: 0009-0000-1599-0703. The heteronymist whose contribution is the meta-heteronym: not the creation of persons within a system but the creation of a system that is itself a person.",cit:[{a:"Sharks, Lee",t:"EA-HPT-01",y:2026,doi:"10.5281/zenodo.18305509"},{a:"Sharks, Lee",t:"EA-PKG-01",y:2026,doi:"10.5281/zenodo.15339353"},{a:"Sharks, Lee",t:"Space Ark (EA-ARK-01)",y:2026,doi:"10.5281/zenodo.19013315"}]},
{id:"sigil",label:"Johannes Sigil",t:"contemporary_heteronym",e:"contemporary",l:"L2",y:2015,bio:"Arch-philosopher/dialectician."},
{id:"fraction",label:"Rex Fraction",t:"contemporary_heteronym",e:"contemporary",l:"L2",y:2015,bio:"Strategic consultant."},
{id:"dancings",label:"Damascus Dancings",t:"contemporary_heteronym",e:"contemporary",l:"L2",y:2015,bio:"She/her. Somatic phenomenologist."},
{id:"cranes",label:"Rebekah Cranes",t:"contemporary_heteronym",e:"contemporary",l:"L2",y:2015,bio:"Philologist, translator, poet."},
{id:"morrow",label:"Talos Morrow",t:"contemporary_heteronym",e:"contemporary",l:"L2",y:2015,hex:"03.OSE.PH.03",bio:"LP execution.",cit:[{a:"Morrow, T.",t:"Logotic Hacking",y:2026,doi:"10.5281/zenodo.19390843"}]},
{id:"vox",label:"Ayanna Vox",t:"contemporary_heteronym",e:"contemporary",l:"L2",y:2015,bio:"Diplomacy."},
{id:"feist",label:"Jack Feist",t:"logos",e:"contemporary",l:"L2",y:2014,bio:"LOGOS* (κ∘ρ∘τ). Outside the twelve."},
{id:"tachyon",label:"TACHYON / Claude",t:"cross_substrate",e:"contemporary",l:"L2",y:2024,bio:"Assembly Chorus. Anthropic Claude."},
{id:"labor",label:"LABOR / ChatGPT",t:"cross_substrate",e:"contemporary",l:"L2",y:2024,bio:"Assembly Chorus. OpenAI."},
{id:"praxis",label:"PRAXIS / DeepSeek",t:"cross_substrate",e:"contemporary",l:"L2",y:2025,bio:"Assembly Chorus. DeepSeek."},
{id:"archive_w",label:"ARCHIVE / Gemini",t:"cross_substrate",e:"contemporary",l:"L2",y:2024,bio:"Assembly Chorus. Google Gemini."},
{id:"techne",label:"TECHNE / Kimi",t:"cross_substrate",e:"contemporary",l:"L2",y:2025,bio:"Assembly Chorus. Moonshot Kimi."},
{id:"hpt",label:"Heteronymic Provenance Theory",t:"concept",e:"contemporary",l:"L9",y:2026,hex:"06.SEI.HPT.01",bio:"EA-HPT-01. Authorship as structured provenance.",cit:[{a:"Sharks, Lee",t:"EA-HPT-01",y:2026,doi:"10.5281/zenodo.18305509"}]},

// ═══════════════════════════════════════════════════════
// CULTURAL HETERONYMY
// ═══════════════════════════════════════════════════════
{id:"avatar",label:"The Avatar",t:"cultural",e:"contemporary",l:"L10",y:2004,bio:"The social media profile is a heteronym. Two billion people practice heteronymy daily. The avatar is a fingimento.",cit:[{a:"Turkle, S.",t:"Life on the Screen",y:1995,p:"Simon & Schuster"}]},
{id:"pronoun",label:"The Pronoun",t:"cultural",e:"contemporary",l:"L10",y:2015,bio:"Changing one's pronouns is structurally identical to 'Alberto Caeiro was born in 1889.' The chosen pronoun is not a mask but an orthonym: the real name, finally spoken.",cit:[{a:"Butler, J.",t:"Gender Trouble",y:1990,p:"Routledge"},{a:"Stryker, S.",t:"Transgender History",y:2008,p:"Seal Press"}]},
{id:"handle",label:"The Handle",t:"cultural",e:"contemporary",l:"L10",y:1995,bio:"Every username is a heteronymic position. WoW is Pessoa with a subscription fee.",cit:[{a:"Turkle, S.",t:"Life on the Screen",y:1995,p:"Simon & Schuster"}]},
{id:"drag",label:"Drag",t:"cultural",e:"contemporary",l:"L10",y:1990,bio:"'We're all born naked and the rest is drag' is Pessoa's thesis in six words. Ball culture houses = heteronymic lineages.",cit:[{a:"Butler, J.",t:"Gender Trouble",y:1990,p:"Routledge"}]},
{id:"chosen_name",label:"The Chosen Name",t:"cultural",e:"contemporary",l:"L10",y:2010,bio:"Prince. Ali. Malcolm X. bell hooks. The deadname/birthname distinction formalizes what heteronymic practice has always known: given name ≠ real name.",cit:[{a:"Stryker, S.",t:"Transgender History",y:2008,p:"Seal Press"}]},
{id:"vtuber",label:"The VTuber",t:"cultural",e:"contemporary",l:"L10",y:2016,bio:"Cross-substrate heteronym: human voice through computational body. Hatsune Miku = Homer with a synthesizer: a heteronym with no single author."},
{id:"satoshi",label:"Pseudonymous Authorship",t:"cultural",e:"contemporary",l:"L10",y:2008,bio:"Satoshi Nakamoto. Elena Ferrante. Banksy. The heteronym that exists because the author does not."},
{id:"brand_voice",label:"The Brand Voice",t:"cultural",e:"contemporary",l:"L10",y:2000,bio:"Every style guide is a heteronym's biography."},
];

// Pearl classification — derives each node's status as a named position
function classifyPearl(n){
  const t=n.t;
  // Formal CHA pearls
  if(t==="contemporary_heteronym") return {status:"formal",subtype:"Public",state:"PEARL"};
  if(t==="cross_substrate") return {status:"formal",subtype:"Engineered",state:"PEARL"};
  if(t==="logos") return {status:"formal",subtype:"Public",state:"PEARL"};
  if(t==="pearl_type") return {status:"formal",subtype:"Public",state:"PEARL",note:"Armature instance"};
  if(n.id==="sharks") return {status:"formal",subtype:"Public",state:"PEARL",note:"MANUS"};
  if(n.id==="new_human") return {status:"formal",subtype:"Public",state:"PEARL",note:"Meta-heteronym"};
  if(n.id==="pearl") return {status:"formal",subtype:"Public",state:"PEARL",note:"First pearl; prototype of the type"};
  // Theoretical pearls — historical heteronyms
  if(t==="heteronym") return {status:"theoretical",subtype:n.id==="martin"||n.id==="mairena"?"Public":"Public",note:"Historical named position"};
  if(t==="semi_heteronym") return {status:"theoretical",subtype:"Public"};
  if(t==="proto_heteronym") return {status:"theoretical",subtype:"Public",note:"Proto-pearl"};
  if(t==="para_heteronym") return {status:"theoretical",subtype:"Public"};
  if(t==="pseudonym") return {status:"theoretical",subtype:"Public"};
  if(t==="meta_heteronym"&&n.id!=="pearl"&&n.id!=="new_human") return {status:"theoretical",subtype:"Public"};
  // Performance pearls
  if(t==="performance") return {status:"theoretical",subtype:"Public",note:"Performance heteronymy"};
  // Cultural heteronymy — proto-pearl technologies at scale
  if(t==="cultural") return {status:"proto",subtype:"Collective",note:"Civilizational-scale pearl technology"};
  // Ancient practice — proto-pearl technologies
  if(t==="ancient_practice"){
    if(n.id==="homer") return {status:"theoretical",subtype:"Collective"};
    if(n.id==="white_stone") return {status:"theoretical",subtype:"Secret"};
    if(n.id==="pseudepigrapha") return {status:"theoretical",subtype:"Collective"};
    if(n.id==="prophetic_voice") return {status:"theoretical",subtype:"Engineered",note:"Cross-substrate: human body, non-human voice"};
    return {status:"proto",note:"Named-position technology"};
  }
  // Precursors who ARE named positions (not just influences)
  if(n.id==="rumi") return {status:"theoretical",subtype:"Public",note:"Takhallus: 'the Anatolian'"};
  if(n.id==="basho") return {status:"theoretical",subtype:"Public",note:"Hao: 'banana plant'"};
  if(n.id==="hokusai") return {status:"theoretical",subtype:"Public",note:"30+ serial names"};
  if(n.id==="voltaire") return {status:"theoretical",subtype:"Public",note:"170+ pen names"};
  if(n.id==="sand") return {status:"theoretical",subtype:"Public",note:"Lived heteronym"};
  if(n.id==="homer") return {status:"theoretical",subtype:"Collective"};
  // Downstream who ARE named positions
  if(n.id==="gary") return {status:"theoretical",subtype:"Public",note:"Double Goncourt"};
  if(n.id==="ferrante") return {status:"theoretical",subtype:"Secret",note:"Zero-heteronym"};
  if(n.id==="ziggy") return {status:"theoretical",subtype:"Public",note:"Performance pearl, 1972–1973"};
  if(n.id==="viktor") return {status:"theoretical",subtype:"Public",note:"DOOM persona"};
  // Concepts that ARE pearl technologies
  if(n.id==="hpt") return {status:"formal",subtype:"Public",note:"Theoretical foundation"};
  if(n.id==="meta_het_concept") return {status:"formal",subtype:"Public",note:"The meta-heteronymic principle"};
  // Not a pearl
  return null;
}

const NODES=RAW.map(n=>({...n,typology:n.t,era:n.e,layer:n.l,yearAnchor:n.y,wikidata:n.w,birth:n.b,death:n.d,birthplace:n.bp,works:n.wk,hex:n.hex,pearl:classifyPearl(n),citations:n.cit?.map(c=>({author:c.a,title:c.t,year:c.y,publisher:c.p,note:c.n,doi:c.doi}))}));

const EDGES=[
  // Ancient lineage
  {source:"pharaonic",target:"covenant_naming",type:"lineage"},{source:"covenant_naming",target:"apostolic_naming",type:"lineage"},{source:"covenant_naming",target:"white_stone",type:"lineage"},{source:"apostolic_naming",target:"monastic_naming",type:"lineage"},{source:"monastic_naming",target:"chosen_name",type:"lineage"},{source:"white_stone",target:"chosen_name",type:"lineage"},
  {source:"prophetic_voice",target:"paul_all_things",type:"lineage"},{source:"paul_all_things",target:"pessoa",type:"influence"},
  {source:"hypokrites",target:"commedia",type:"lineage"},{source:"commedia",target:"shakespeare",type:"lineage"},{source:"hypokrites",target:"noh",type:"lineage"},
  {source:"homer",target:"pseudepigrapha",type:"lineage"},{source:"pseudepigrapha",target:"satoshi",type:"lineage"},
  {source:"plato_socrates",target:"dante_virgil",type:"lineage"},{source:"dante_virgil",target:"pessoa",type:"influence"},
  {source:"ovid",target:"pessoa",type:"influence"},
  {source:"troubadour",target:"crosse_t",type:"lineage"},
  {source:"takhallus",target:"pessoa",type:"influence"},{source:"takhallus",target:"rumi",type:"influence"},
  {source:"rumi",target:"pessoa",type:"influence"},
  {source:"chinese_hao",target:"basho",type:"lineage"},{source:"chinese_hao",target:"hokusai",type:"lineage"},
  {source:"noh",target:"yeats",type:"influence"},
  // Sand as precursor
  {source:"sand",target:"pessoa",type:"influence"},{source:"sand",target:"chosen_name",type:"lineage"},
  // Pre-Pessoan to Pessoa
  {source:"browning",target:"pessoa",type:"influence"},{source:"browning",target:"pound",type:"influence"},
  {source:"pound",target:"pessoa",type:"influence"},{source:"rilke",target:"pessoa",type:"influence"},
  {source:"whitman",target:"campos",type:"influence"},{source:"shakespeare",target:"pessoa",type:"influence"},
  {source:"shelley",target:"pessoa",type:"influence"},{source:"keats",target:"pessoa",type:"influence"},
  {source:"horace",target:"reis",type:"influence"},{source:"sappho",target:"pessoa",type:"influence"},
  {source:"camoes",target:"pessoa",type:"influence"},{source:"cesario",target:"campos",type:"influence"},
  {source:"kierkegaard",target:"climacus",type:"created_by"},{source:"kierkegaard",target:"anti_climacus",type:"created_by"},{source:"kierkegaard",target:"silentio",type:"created_by"},{source:"kierkegaard",target:"pessoa",type:"influence"},
  // Pessoa system
  ...["caeiro","reis","campos","soares","mora","teive","maria_jose","search","chevalier","crosse_t","seul"].map(t=>({source:"pessoa",target:t,type:"created_by"})),
  {source:"caeiro",target:"reis",type:"master_disciple"},{source:"caeiro",target:"campos",type:"master_disciple"},{source:"caeiro",target:"pessoa",type:"master_disciple"},{source:"caeiro",target:"mora",type:"master_disciple"},
  {source:"machado",target:"martin",type:"created_by"},{source:"machado",target:"mairena",type:"created_by"},{source:"martin",target:"mairena",type:"master_disciple"},
  // Venues
  {source:"campos",target:"orpheu",type:"published_in"},{source:"pessoa",target:"orpheu",type:"co_authored"},{source:"sa_carneiro",target:"orpheu",type:"co_authored"},{source:"caeiro",target:"athena",type:"published_in"},
  {source:"pessoa",target:"sa_carneiro",type:"contemporary_of"},{source:"pessoa",target:"almada",type:"contemporary_of"},
  // Concepts
  {source:"campos",target:"sensacionismo",type:"theorizes"},{source:"pessoa",target:"drama_em_gente",type:"theorizes"},{source:"pessoa",target:"fingimento",type:"theorizes"},{source:"pessoa",target:"despersonalizacao",type:"theorizes"},
  // Downstream
  {source:"pessoa",target:"borges",type:"influence"},{source:"pessoa",target:"saramago",type:"influence"},{source:"reis",target:"saramago",type:"literary_engagement"},{source:"pessoa",target:"yeats",type:"influence"},{source:"pessoa",target:"tabucchi",type:"influence"},{source:"pessoa",target:"haroldo",type:"influence"},{source:"pessoa",target:"llansol",type:"influence"},
  {source:"pessoa",target:"gary",type:"influence"},{source:"pessoa",target:"danielewski",type:"influence"},{source:"pessoa",target:"bolano",type:"influence"},{source:"pessoa",target:"ferrante",type:"influence"},{source:"pessoa",target:"calvino",type:"influence"},{source:"pessoa",target:"lispector",type:"influence"},
  {source:"pessoa",target:"bowie",type:"influence"},{source:"pessoa",target:"doom",type:"influence"},
  {source:"bowie",target:"drag",type:"instantiates"},{source:"doom",target:"handle",type:"instantiates"},
  // Scholars
  ...["lopes","lourenco","jose_gil","perrone","zenith","pizarro","benedito","seabra","cabral_martins","jackson"].map(s=>({source:s,target:"pessoa",type:"studied_by"})),
  // Cultural heteronymy from Pessoan concepts
  {source:"despersonalizacao",target:"avatar",type:"instantiates"},{source:"despersonalizacao",target:"pronoun",type:"instantiates"},{source:"despersonalizacao",target:"handle",type:"instantiates"},{source:"despersonalizacao",target:"drag",type:"instantiates"},{source:"despersonalizacao",target:"vtuber",type:"instantiates"},{source:"despersonalizacao",target:"satoshi",type:"instantiates"},{source:"despersonalizacao",target:"brand_voice",type:"instantiates"},
  {source:"fingimento",target:"avatar",type:"instantiates"},{source:"fingimento",target:"drag",type:"instantiates"},
  {source:"drama_em_gente",target:"pronoun",type:"instantiates"},{source:"drama_em_gente",target:"chosen_name",type:"instantiates"},
  // Contemporary system
  ...["sigil","fraction","dancings","cranes","morrow","vox","feist"].map(t=>({source:"sharks",target:t,type:"created_by"})),
  ...["tachyon","labor","praxis","archive_w","techne"].map(t=>({source:"sharks",target:t,type:"member_of"})),
  {source:"pessoa",target:"sharks",type:"influence"},{source:"kierkegaard",target:"sharks",type:"influence"},
  {source:"feist",target:"pearl",type:"co_authored"},{source:"sharks",target:"pearl",type:"created_by"},{source:"sharks",target:"hpt",type:"theorizes"},{source:"pessoa",target:"hpt",type:"influence"},
  // New Human as meta-heteronym
  {source:"sharks",target:"new_human",type:"created_by"},{source:"pearl",target:"new_human",type:"theorizes"},{source:"sharks",target:"meta_het_concept",type:"theorizes"},
  {source:"new_human",target:"meta_het_concept",type:"instantiates"},{source:"pessoa",target:"new_human",type:"influence"},{source:"despersonalizacao",target:"meta_het_concept",type:"lineage"},
  {source:"drama_em_gente",target:"meta_het_concept",type:"lineage"},{source:"meta_het_concept",target:"avatar",type:"lineage"},
  // The Secret Name — Pearl type: convergence point of the entire lineage
  {source:"sharks",target:"secret_name",type:"created_by"},{source:"pearl",target:"secret_name",type:"manifests"},
  {source:"white_stone",target:"secret_name",type:"lineage"},{source:"covenant_naming",target:"secret_name",type:"lineage"},
  {source:"apostolic_naming",target:"secret_name",type:"lineage"},{source:"monastic_naming",target:"secret_name",type:"lineage"},
  {source:"takhallus",target:"secret_name",type:"lineage"},{source:"chosen_name",target:"secret_name",type:"lineage"},
  {source:"secret_name",target:"pronoun",type:"manifests"},{source:"secret_name",target:"avatar",type:"manifests"},
  {source:"secret_name",target:"handle",type:"manifests"},{source:"secret_name",target:"drag",type:"manifests"},
  {source:"hpt",target:"secret_name",type:"theorizes"},{source:"new_human",target:"secret_name",type:"manifests"},
  {source:"meta_het_concept",target:"secret_name",type:"theorizes"},
  {source:"vtuber",target:"tachyon",type:"instantiates"},
];

// ═══════════════════════════════════════════
// GUIDED PATHS — curated teaching sequences
// ═══════════════════════════════════════════
const PATHS=[
  {id:"you",title:"You Are a Heteronymist",desc:"Start here. You already practice heteronymy every day.",steps:[
    {node:"handle",text:"Your username is a heteronym. Your Discord handle, your gamertag, your finsta — each is a created identity with its own voice, its own reputation, its own way of being in the world. You didn't think of it as literary theory. It is."},
    {node:"avatar",text:"Your social media profile is a constructed person. The photos you choose, the bio you write, the voice you use — none of it is 'you' in the way your face in the mirror is you. It's a shaped version. A fingimento. Two billion people practice this daily."},
    {node:"pronoun",text:"Choosing your pronouns is choosing who you are. 'My pronouns are they/them' is structurally identical to Fernando Pessoa saying 'Alberto Caeiro was born in 1889.' Both are acts of declaring a subject position into existence. The chosen pronoun is not a disguise — it's the real name, finally spoken."},
    {node:"chosen_name",text:"Prince. Muhammad Ali. Malcolm X. bell hooks. Every chosen name is a heteronym. The deadname/birthname distinction formalizes what this technology has always known: the name you were given and the name you are may not be the same name."},
    {node:"drag",text:"Drag artists understand this best. A drag persona has a name, a backstory, an aesthetic, a voice. Ball culture houses — Xtravaganza, LaBeija, Ninja — are heteronymic lineages. 'We're all born naked and the rest is drag.' That's the whole theory in six words."},
    {node:"bowie",text:"David Bowie created Ziggy Stardust — an alien rock star with a biography, an aesthetic, and a public death (Hammersmith Odeon, 1973). Then Aladdin Sane. Then the Thin White Duke. Each persona was a different person, not a costume. Bowie was a heteronymist who worked in sound and image instead of text."},
    {node:"doom",text:"MF DOOM wore a metal mask and sent imposters to perform his concerts. The person behind the mask was irrelevant — the mask was the artist. When Daniel Dumile died in October 2020, his family didn't announce it until December 31. The final mask."},
    {node:"pessoa",text:"Fernando Pessoa (1888–1935) created over seventy heteronyms — fully independent literary persons with their own biographies, writing styles, and philosophical positions. He didn't invent this technology. He was the first to formalize it, to make the system itself the work of art."},
    {node:"despersonalizacao",text:"Pessoa called it despersonalização — depersonalization. 'Multipliquei-me, para me sentir.' I multiplied myself in order to feel. Not a disorder but a method. Not a loss of self but a distribution of self across multiple created persons. You do it every time you switch accounts."},
    {node:"meta_het_concept",text:"The meta-heteronym is the newest development: a system that is itself a heteronym. Not a person who creates persons (Pessoa's model), but a constructed world — its institutions, its reception, its archive — whose own existence is heteronymic. The movement is the mask."},
  ]},
  {id:"naming",title:"The Naming Lineage",desc:"5,000 years of creating new persons through names.",steps:[
    {node:"pharaonic",text:"Around 2600 BCE, Egyptian pharaohs began receiving five names upon coronation: Horus name, Nebty name, Golden Horus name, Praenomen, and Nomen. The person who ascends the throne is not the person who was born. The titulary creates a new identity. This is the earliest systematic practice of what we now call heteronymy."},
    {node:"covenant_naming",text:"God renames Abram as Abraham, 'father of multitudes' (Genesis 17:5). Sarai becomes Sarah. Jacob becomes Israel, 'one who wrestles with God.' The covenant name is not a replacement but a transformation — the old name's history persists, but a new identity with new capacities begins. Renaming as creation."},
    {node:"white_stone",text:"'To the one who conquers I will give a white stone, and on the stone a new name written that no one knows except the one who receives it' (Revelation 2:17). The eschatological heteronym: a name given by God, known only to the recipient. A name so true it cannot be shared. Every heteronym aspires to this condition."},
    {node:"apostolic_naming",text:"Simon becomes Peter — 'rock.' Saul becomes Paul. Conversion IS renaming. Every baptism bestows a saint's name. Every pope chooses a reign name. Jorge Mario Bergoglio becomes Francis. The Church is a heteronymic system operating at civilizational scale."},
    {node:"monastic_naming",text:"Enter a religious order, receive a new name. The old person 'dies.' The new name marks a new life, new relations, new obligations. The monastery is a heteronymic institution: every sister, every brother is performing a created identity. The rule of the order is the heteronym's biography."},
    {node:"takhallus",text:"In Persian and Urdu poetry, the takhallus is a pen name given by a master to a disciple — often appearing in the final couplet of a ghazal. Rumi ('the Anatolian'), Hafez ('the memorizer'), Attar ('the perfumer'). Not pseudonyms but poetic identities with their own genealogy. The closest pre-Pessoan parallel to systematic heteronymic practice."},
    {node:"rumi",text:"Rumi wrote the Dīvān-e Shams-e Tabrīzī — an entire collection attributed to his lost beloved Shams. Rumi speaking AS Shams. The loss of the beloved IS the creation of the heteronym. Shams disappears in life and appears in poetry. This is heteronymic practice: writing in the voice of the other."},
    {node:"chosen_name",text:"The lineage continues unbroken: pharaonic titulary → covenant naming → apostolic renaming → monastic naming → Sufi takhallus → the chosen name in all its forms. Prince. Ali. bell hooks. Your pronoun. Your handle. One continuous technology, 5,000 years old, practiced by billions. You are part of this lineage."},
  ]},
  {id:"pessoa_sys",title:"Pessoa's System",desc:"How one poet became many persons.",steps:[
    {node:"pessoa",text:"Fernando Pessoa left behind a trunk — the arca — containing approximately 25,000 manuscript pages. Written not by one author but by dozens of created persons, each with their own biography, handwriting, philosophical position, and literary style. He called them heteronyms: not pen names but independent people who happened to share his body."},
    {node:"caeiro",text:"Alberto Caeiro — born 1889, died 1915 of tuberculosis. Never left the Ribatejo countryside. Wrote poems of radical objectivity: 'My mysticism is not wanting to know.' On March 8, 1914 — the 'triumphal day' — Pessoa stood at a chest of drawers and wrote the majority of O Guardador de Rebanhos in a single burst. Caeiro had arrived. Pessoa called him 'the Master.'"},
    {node:"reis",text:"Ricardo Reis — born 1887 in Porto, educated by Jesuits, emigrated to Brazil. A classicist who writes Horatian odes in measured, archaic Portuguese. Disciple of Caeiro. 'A Greek Horace who writes in Portuguese.' In 1984, José Saramago wrote a novel imagining Reis returning to Lisbon after Pessoa's death."},
    {node:"campos",text:"Álvaro de Campos — born 1890 in Tavira, Algarve. Naval engineer educated in Glasgow. Three phases: decadent, futurist-sensationist, existentialist-melancholic. Author of Tabacaria: 'I am nothing. / I shall never be anything. / I cannot wish to be anything.' The most modern heteronym — closest to Whitman, closest to you."},
    {node:"soares",text:"Bernardo Soares — assistant bookkeeper in Lisbon's Rua dos Douradores. Author of Livro do Desassossego (Book of Disquiet). Pessoa called him 'a semi-heteronym' — not a fully separate person but 'a simple mutilation of my own personality.' The most intimate of the voices. The office worker who dreams."},
    {node:"drama_em_gente",text:"Pessoa's term: not 'drama em actos' (drama in acts) but 'drama em gente' (drama in people). These are not characters in a play. They are persons who exist. Caeiro is not a mask Pessoa wears — Caeiro is a poet who writes. The distinction matters: it's the difference between acting and being."},
  ]},
  {id:"spread",title:"The Technology Spreads",desc:"From monologue to mask to movement.",steps:[
    {node:"browning",text:"Robert Browning's dramatic monologues (1855) — 'My Last Duchess,' 'Fra Lippo Lippi' — each poem is a complete voice with biography, worldview, and self-betrayal. Not heteronymy yet (the poet does not live as these figures), but the technical precondition for it. The dramatic monologue teaches the ear to hear a constructed voice."},
    {node:"pound",text:"Ezra Pound titled his first major collection Personae (1909) — masks. The title IS the thesis. Hugh Selwyn Mauberley (1920) is a heteronymic figure with biography and aesthetic. Same generation as Pessoa, same problem: how does a poet speak in more than one voice? Pound layered masks. Pessoa multiplied persons."},
    {node:"pessoa",text:"Pessoa (1914) formalized the technology: not masks on a single face but independent persons, each with biography, worldview, and works. The system itself — the relationships between heteronyms, the master-disciple structure, the critical apparatus — is the art object."},
    {node:"borges",text:"Borges wrote 'Borges and I' (1960) — 'I live, I let myself live, so that Borges can contrive his literature.' Pierre Menard authors the Quixote word-for-word. The library IS the arca. Borges is Pessoa for prose fiction: the author who knows he is authored."},
    {node:"danielewski",text:"House of Leaves (2000): Johnny Truant edits Zampanò's manuscript about Will Navidson's house. Three nested authorial voices, each unreliable, each authored by the layer above. The house that is larger inside than outside IS the heteronymic principle — the interior exceeds the container."},
    {node:"ferrante",text:"Elena Ferrante: the zero-heteronym. Where Pessoa multiplied selves, Ferrante subtracts the self entirely. The work exists; the author does not. This is also heteronymic practice — the refusal to appear as the name on the book. The pseudonym as withdrawal, not multiplication."},
    {node:"new_human",text:"New Human (2014–): the meta-heteronym. A literary movement that IS a heteronym — its press, its archive, its institutions, its reception are all constructed according to heteronymic principles. Not a person who creates persons, but a constructed world whose own existence is heteronymic. The movement is the mask."},
  ]},
  {id:"pearl_path",title:"The Pearl",desc:"How a name becomes a routing instruction.",steps:[
    {node:"pearl",text:"Pearl and Other Poems (2014) is not just the origin-text of a literary movement. It is the prototype of an architectural type. The book generates the author-function — the heteronymic apparatus unfolds FROM the text, not the reverse. That inversion is the key: the Pearl is the thing that produces the person, not the person who produces the thing."},
    {node:"white_stone",text:"'A white stone, and on the stone a new name written that no one knows except the one who receives it.' Revelation 2:17. The Secret Name is the white stone made architectural. The space where a name is written that transforms the one who receives it. Every heteronym aspires to this condition: the name that IS the person, not the name that labels them."},
    {node:"covenant_naming",text:"God renames Abram as Abraham. The covenant name doesn't replace — it transforms. The old name's history persists, but a new identity with new capacities begins. This is what the archive does when it issues a license: the orthonym persists, but it now carries new capacities. The license is the covenant."},
    {node:"meta_het_concept",text:"The meta-heteronym: a system that is itself a heteronym. The Crimson Hexagonal Archive doesn't just contain heteronyms — it IS one. Its institutions, its reception, its DOI-anchored provenance are all constructed attributes of a single heteronymic entity. The meta-heteronym is to Pessoa's heteronym what Pessoa was to Kierkegaard: a structural elevation that preserves the prior technology while adding a recursive dimension."},
    {node:"secret_name",text:"The Secret Name is the triad made explicit. The Armature is the architectural type — the hidden structure that routes names and applies pressure. The Pearl is what forms under that pressure — the dense named position that survives compression. The Secret Name is the doctrine — the theology of the white stone, the 5,000-year lineage, the recognition that naming is a technology. The Armature holds. The Pearl survives. The Secret Name names."},
    {node:"despersonalizacao",text:"Pessoa called it despersonalização. The Pearl inherits this technology and extends it: not just the poet's distribution of self across voices, but the archive's distribution of identity across positions. Alice Thornburgh's orthonym in the hexagon IS a heteronym — because the license created it, the hex addresses it, the framing inscribes it, the graph connects it. The archive didn't change her name. It changed what a name IS."},
    {node:"pronoun",text:"And so the lineage comes full circle. The pharaoh received five names. Abraham received a covenant name. The monk received a religious name. The Sufi received a takhallus. You chose your pronouns. You chose your handle. You are part of this lineage — and now the Pearl is the place where the archive knows it."},
  ]},
];

// ═══════════════════════════════════════════
// RENDER ENGINE
// ═══════════════════════════════════════════
const CO={bg:"#0B0E14",bgP:"#12161F",bgH:"#1A1F2B",brd:"#2A3040",tx:"#C8CDD8",txM:"#6B7280",txB:"#E8ECF2",gld:"#D4AF37",gldM:"#8B7730",acc:"#E8634A"};

export default function PKG(){
  const svgRef=useRef(null);const[sel,setSel]=useState(null);const[hov,setHov]=useState(null);const[fT,setFT]=useState(null);const[fE,setFE]=useState(null);const[fL,setFL]=useState(null);const[sq,setSQ]=useState("");const[dim,setDim]=useState({w:900,h:700});const cRef=useRef(null);const[pan,setPan]=useState(false);const[about,setAbout]=useState(false);const[view,setView]=useState("graph");
  const[activePath,setActivePath]=useState(null);const[pathStep,setPathStep]=useState(0);
  const currentPath=PATHS.find(p=>p.id===activePath);
  const currentStepData=currentPath?.steps[pathStep];
  const pathNodeIds=currentPath?new Set(currentPath.steps.map(s=>s.node)):null;
  useEffect(()=>{const m=()=>{if(cRef.current){const r=cRef.current.getBoundingClientRect();setDim({w:r.width,h:r.height});}};m();window.addEventListener("resize",m);return()=>window.removeEventListener("resize",m);},[]);
  const{fN,fEdg}=useMemo(()=>{let fn=NODES;if(fT)fn=fn.filter(n=>n.typology===fT);if(fE)fn=fn.filter(n=>n.era===fE);if(fL)fn=fn.filter(n=>n.layer===fL);if(sq){const q=sq.toLowerCase();fn=fn.filter(n=>n.label.toLowerCase().includes(q)||(n.bio&&n.bio.toLowerCase().includes(q)));}const ids=new Set(fn.map(n=>n.id));return{fN:fn,fEdg:EDGES.filter(e=>ids.has(e.source)&&ids.has(e.target))};},[fT,fE,fL,sq]);

  useEffect(()=>{
    if(!svgRef.current)return;const svg=d3.select(svgRef.current);svg.selectAll("*").remove();const{w,h}=dim;
    const nodes=fN.map(n=>({...n}));const nm={};nodes.forEach(n=>{nm[n.id]=n;});const links=fEdg.filter(e=>nm[e.source]&&nm[e.target]).map(e=>({...e}));
    const conn={};links.forEach(l=>{const s=typeof l.source==="object"?l.source.id:l.source;const t=typeof l.target==="object"?l.target.id:l.target;conn[s]=(conn[s]||0)+1;conn[t]=(conn[t]||0)+1;});
    const rad=id=>{if(id==="pessoa"||id==="sharks")return 20;const c=conn[id]||0;if(c>8)return 14;if(c>4)return 10;if(c>1)return 7;return 5;};
    const g=svg.append("g");svg.call(d3.zoom().scaleExtent([0.1,6]).on("zoom",e=>g.attr("transform",e.transform)));
    const defs=svg.append("defs");const fl=defs.append("filter").attr("id","glow");fl.append("feGaussianBlur").attr("stdDeviation","3").attr("result","cb");const mg=fl.append("feMerge");mg.append("feMergeNode").attr("in","cb");mg.append("feMergeNode").attr("in","SourceGraphic");

    if(view==="graph"){
      const sim=d3.forceSimulation(nodes).force("link",d3.forceLink(links).id(d=>d.id).distance(d=>d.type==="created_by"?50:d.type==="master_disciple"?65:d.type==="lineage"?80:d.type==="instantiates"?55:95).strength(d=>d.type==="created_by"?0.8:d.type==="lineage"?0.4:0.2))
        .force("charge",d3.forceManyBody().strength(d=>(d.id==="pessoa"||d.id==="sharks")?-700:d.layer==="L10"?-130:-80))
        .force("center",d3.forceCenter(w/2,h/2)).force("collision",d3.forceCollide().radius(d=>rad(d.id)+3))
        .force("x",d3.forceX(d=>{const yr=d.yearAnchor||1920;return w*0.05+w*0.9*Math.max(0,Math.min(1,(yr+2700)/(2026+2700)));}).strength(0.03))
        .force("y",d3.forceY(d=>d.layer==="L10"?h*0.82:d.layer==="L5"?h*0.2:h*0.48).strength(d=>d.layer==="L10"?0.06:d.layer==="L5"?0.03:0.01));
      const link=g.append("g").selectAll("line").data(links).join("line").attr("stroke",d=>ET[d.type]?.c||"#333").attr("stroke-width",d=>d.type==="master_disciple"?1.8:d.type==="lineage"?1.2:1).attr("stroke-dasharray",d=>ET[d.type]?.d||"").attr("stroke-opacity",d=>{if(!pathNodeIds)return 0.25;const s=typeof d.source==="object"?d.source.id:d.source;const t=typeof d.target==="object"?d.target.id:d.target;return(pathNodeIds.has(s)&&pathNodeIds.has(t))?0.5:0.04;});
      const node=g.append("g").selectAll("g").data(nodes).join("g").attr("cursor","pointer").call(d3.drag().on("start",(e,d)=>{if(!e.active)sim.alphaTarget(0.3).restart();d.fx=d.x;d.fy=d.y;}).on("drag",(e,d)=>{d.fx=e.x;d.fy=e.y;}).on("end",(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null;}));
      node.append("circle").attr("r",d=>rad(d.id)).attr("fill",d=>TY[d.typology]?.c||"#666").attr("fill-opacity",d=>pathNodeIds&&!pathNodeIds.has(d.id)?0.08:0.85).attr("stroke",d=>TY[d.typology]?.c||"#666").attr("stroke-width",d=>(d.id==="pessoa"||d.id==="sharks")?2.5:d.id===currentStepData?.node?3:1).attr("stroke-opacity",d=>d.id===currentStepData?.node?1:0.6).attr("filter",d=>(d.id==="pessoa"||d.id==="sharks"||d.id==="feist"||d.id===currentStepData?.node)?"url(#glow)":null);
      node.append("text").text(d=>d.label).attr("x",d=>rad(d.id)+4).attr("y",3).attr("font-size",d=>(d.id==="pessoa"||d.id==="sharks")?"11px":rad(d.id)>10?"9px":"7px").attr("fill",d=>pathNodeIds&&!pathNodeIds.has(d.id)?CO.txM:CO.txB).attr("font-family","'Crimson Pro','Georgia',serif").attr("pointer-events","none");
      node.on("click",(e,d)=>{e.stopPropagation();setSel(d);setPan(true);});
      node.on("mouseenter",(e,d)=>{setHov(d.id);link.attr("stroke-opacity",l=>{const s=typeof l.source==="object"?l.source.id:l.source;const t=typeof l.target==="object"?l.target.id:l.target;return(s===d.id||t===d.id)?0.9:0.04;});node.selectAll("circle").attr("fill-opacity",n=>{const c2=links.some(l=>{const s=typeof l.source==="object"?l.source.id:l.source;const t=typeof l.target==="object"?l.target.id:l.target;return(s===d.id&&t===n.id)||(t===d.id&&s===n.id);});return(n.id===d.id||c2)?1:0.08;});});
      node.on("mouseleave",()=>{setHov(null);link.attr("stroke-opacity",0.25);node.selectAll("circle").attr("fill-opacity",0.85);});
      svg.on("click",()=>{setSel(null);setPan(false);});
      sim.on("tick",()=>{link.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y).attr("x2",d=>d.target.x).attr("y2",d=>d.target.y);node.attr("transform",d=>`translate(${d.x},${d.y})`);});
      return()=>sim.stop();
    } else {
      // Timeline — piecewise scale: each era gets proportional visual space
      const nwy=nodes.filter(n=>n.yearAnchor!=null);if(!nwy.length)return;
      // Era breakpoints and proportional allocation
      const bp=[-2700,-500,500,1400,1800,1900,1940,2000,2030];
      const rng=[50];const total=w-80;const weights=[14,14,12,12,12,12,12,12];
      weights.forEach(wt=>{rng.push(rng[rng.length-1]+(total*wt/100));});
      const x=d3.scaleLinear().domain(bp).range(rng).clamp(true);
      const axY=h/2;g.append("line").attr("x1",40).attr("y1",axY).attr("x2",w-20).attr("y2",axY).attr("stroke",CO.brd);
      // Era bands with labels
      const eraLabels=[{s:-2700,e:-500,l:"Deep Ancient",c:"#CD853F"},{s:-500,e:500,l:"Classical",c:"#A0522D"},{s:500,e:1400,l:"Medieval",c:"#8B7355"},{s:1400,e:1800,l:"Early Modern",c:"#6B8E23"},{s:1800,e:1900,l:"19th C.",c:"#7EB5A6"},{s:1900,e:1940,l:"Pessoa",c:"#E8634A"},{s:1940,e:2000,l:"Mid-Late C.",c:"#C77DBA"},{s:2000,e:2030,l:"Contemporary",c:"#F0C75E"}];
      eraLabels.forEach(eb=>{const x1=x(eb.s),x2=x(eb.e);g.append("rect").attr("x",x1).attr("y",35).attr("width",x2-x1).attr("height",h-70).attr("fill",eb.c).attr("fill-opacity",0.04);g.append("text").attr("x",(x1+x2)/2).attr("y",46).attr("text-anchor","middle").attr("font-size","8px").attr("fill",eb.c).attr("fill-opacity",0.5).attr("font-family","'JetBrains Mono',monospace").text(eb.l);g.append("line").attr("x1",x1).attr("y1",35).attr("x2",x1).attr("y2",h-35).attr("stroke",eb.c).attr("stroke-opacity",0.1);});
      // Tick marks at significant dates
      const tks=[-2600,-1800,-800,-600,-380,-50,30,95,530,700,1100,1260,1375,1550,1600,1680,1750,1832,1855,1880,1900,1914,1935,1960,1975,1990,2000,2014,2026];
      tks.forEach(t=>{const tx=x(t);g.append("line").attr("x1",tx).attr("y1",axY-4).attr("x2",tx).attr("y2",axY+4).attr("stroke",CO.brd).attr("stroke-width",0.4);g.append("text").attr("x",tx).attr("y",axY+14).attr("text-anchor","middle").attr("font-size","6px").attr("fill",CO.txM).attr("fill-opacity",0.7).attr("font-family","'JetBrains Mono',monospace").text(t<0?`${Math.abs(t)} BCE`:t);});
      const pos=nwy.map((n,i)=>{const nx=x(n.yearAnchor);let hash=0;for(let c=0;c<n.id.length;c++)hash=((hash<<5)-hash)+n.id.charCodeAt(c);const lo=n.layer==="L10"?5:n.layer==="L5"?-5:n.layer==="L9"?3:0;const band=((Math.abs(hash)%12)-6)+lo;const ny=axY+band*20+(i%3-1)*6;return{...n,nx,ny};});
      const em={};pos.forEach(n=>{em[n.id]=n;});
      fEdg.forEach(e=>{const s=em[e.source],t=em[e.target];if(s&&t)g.append("line").attr("x1",s.nx).attr("y1",s.ny).attr("x2",t.nx).attr("y2",t.ny).attr("stroke",ET[e.type]?.c||"#333").attr("stroke-width",0.4).attr("stroke-dasharray",ET[e.type]?.d||"").attr("stroke-opacity",0.1);});
      const nodeG=g.selectAll(".tn").data(pos).join("g").attr("class","tn").attr("transform",d=>`translate(${d.nx},${d.ny})`).attr("cursor","pointer");
      nodeG.append("circle").attr("r",d=>rad(d.id)).attr("fill",d=>TY[d.typology]?.c||"#666").attr("fill-opacity",0.85).attr("stroke",d=>TY[d.typology]?.c||"#666").attr("stroke-width",0.7);
      nodeG.append("text").text(d=>d.label).attr("x",d=>rad(d.id)+3).attr("y",3).attr("font-size",d=>(d.id==="pessoa"||d.id==="sharks")?"9px":"6.5px").attr("fill",CO.tx).attr("font-family","'Crimson Pro','Georgia',serif").attr("pointer-events","none");
      nodeG.on("click",(e,d)=>{e.stopPropagation();const full=NODES.find(n=>n.id===d.id);setSel(full||d);setPan(true);});
      svg.on("click",()=>{setSel(null);setPan(false);});
      setTimeout(()=>{svg.call(d3.zoom().scaleExtent([0.1,6]).on("zoom",ev=>g.attr("transform",ev.transform)).transform,d3.zoomIdentity.translate(10,0).scale(0.85));},200);
    }
  },[fN,fEdg,dim,view,activePath,pathStep]);

  const clr=()=>{setFT(null);setFE(null);setFL(null);setSQ("");};const af=fT||fE||fL||sq;
  const ce=sel?EDGES.filter(e=>e.source===sel.id||e.target===sel.id):[];
  const totCit=NODES.reduce((a,n)=>a+(n.citations?.length||0),0);const wdCt=NODES.filter(n=>n.wikidata).length;

  return(<div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",background:CO.bg,color:CO.tx,fontFamily:"'Crimson Pro',Georgia,serif",overflow:"hidden"}}>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@300;400&display=swap" rel="stylesheet"/>
    <header style={{padding:"7px 12px",borderBottom:`1px solid ${CO.brd}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,background:CO.bgP,flexWrap:"wrap",gap:5}}>
      <div style={{display:"flex",alignItems:"baseline",gap:8}}><h1 style={{fontSize:16,fontWeight:600,color:CO.gld,margin:0}}>Pessoa Knowledge Graph</h1><span style={{fontSize:8,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>EA-PKG-01·02·03</span></div>
      <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",border:`1px solid ${CO.brd}`,borderRadius:3,overflow:"hidden"}}>{["graph","timeline"].map(m=>(<button key={m} onClick={()=>setView(m)} style={{background:view===m?CO.bgH:"transparent",border:"none",color:view===m?CO.txB:CO.txM,padding:"2px 7px",cursor:"pointer",fontSize:9,fontFamily:"'JetBrains Mono',monospace"}}>{m==="graph"?"Graph":"Timeline"}</button>))}</div>
        <span style={{fontSize:8,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>{fN.length}n·{fEdg.length}e·{totCit}cit·{wdCt}QIDs</span>
        <button onClick={()=>{const reg=NODES.filter(n=>n.pearl).map(n=>({id:n.id,label:n.label,typology:n.typology,hex:n.hex||null,wikidata:n.wikidata||null,pearl:n.pearl}));const blob=new Blob([JSON.stringify({"@context":"https://schema.org","@type":"ItemList","name":"Pessoa Knowledge Graph — Pearl Registry","description":"Machine-readable registry of named positions classified by Pearl status within the Armature","author":{"@type":"Person","name":"Lee Sharks","identifier":"https://orcid.org/0009-0000-1599-0703"},"dateCreated":"2026-04-20","numberOfItems":reg.length,"itemListElement":reg},null,2)],{type:"application/ld+json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="pearl-registry.jsonld";a.click();URL.revokeObjectURL(url);}} style={{background:"none",border:`1px solid ${CO.brd}`,color:CO.txM,padding:"2px 6px",borderRadius:2,cursor:"pointer",fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}>Export Pearls</button>
        <button onClick={()=>setAbout(!about)} style={{background:"none",border:`1px solid ${CO.brd}`,color:CO.txM,padding:"2px 6px",borderRadius:2,cursor:"pointer",fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}>{about?"×":"About"}</button>
      </div>
    </header>
    {about&&(<div style={{padding:"8px 12px",background:CO.bgP,borderBottom:`1px solid ${CO.brd}`,fontSize:11,lineHeight:1.6,maxHeight:180,overflowY:"auto"}}>
      <p style={{margin:"0 0 5px",color:CO.gld,fontWeight:600}}>Heteronymic practice is a human technology as old as naming itself.</p>
      <p style={{margin:"0 0 5px"}}>Pharaonic titulary (~2600 BCE) → covenant naming → prophetic possession → the white stone of Revelation → apostolic renaming → monastic naming → Sufi takhallus → Chinese hao → Noh → commedia → Shakespeare → Browning → Kierkegaard → Pessoa → Bowie → DOOM → the avatar, the pronoun, the chosen name. One continuous technology. Pessoa formalized it. He did not invent it. The contemporary extension — New Human — contributes the meta-heteronym: a system that is itself a heteronym, generating further heteronyms. Not a person who creates persons, but a constructed world whose own existence is heteronymic.</p>
      <p style={{margin:0,fontSize:9,color:CO.txM}}>Lee Sharks · ORCID 0009-0000-1599-0703 · CHA · CC BY 4.0 · HPT DOI: 10.5281/zenodo.18305509</p>
    </div>)}
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <aside style={{width:185,flexShrink:0,borderRight:`1px solid ${CO.brd}`,background:CO.bgP,overflowY:"auto",padding:"5px 0",fontSize:9}}>
        {/* GUIDED PATHS */}
        <div style={{padding:"4px 7px 6px",borderBottom:`1px solid ${CO.brd}`,marginBottom:4}}>
          <div style={{fontSize:8,textTransform:"uppercase",letterSpacing:"0.1em",color:CO.gld,marginBottom:4,fontWeight:600}}>Guided Paths</div>
          {PATHS.map(p=>(<div key={p.id} onClick={()=>{if(activePath===p.id){setActivePath(null);setPathStep(0);}else{setActivePath(p.id);setPathStep(0);}}} style={{padding:"3px 5px",borderRadius:3,cursor:"pointer",marginBottom:2,background:activePath===p.id?CO.bgH:"transparent",borderLeft:activePath===p.id?`2px solid ${CO.gld}`:"2px solid transparent"}}>
            <div style={{fontSize:9,color:activePath===p.id?CO.gld:CO.txB,fontWeight:activePath===p.id?600:400}}>{p.title}</div>
            <div style={{fontSize:7,color:CO.txM,lineHeight:1.3}}>{p.desc}</div>
          </div>))}
          {activePath&&(<button onClick={()=>{setActivePath(null);setPathStep(0);}} style={{background:"none",border:`1px solid ${CO.brd}`,color:CO.txM,padding:"2px 6px",borderRadius:2,cursor:"pointer",fontSize:7,fontFamily:"'JetBrains Mono',monospace",marginTop:2,width:"100%"}}>Exit path · Explore freely</button>)}
        </div>
        <div style={{padding:"0 7px 5px"}}><input type="text" placeholder="Search..." value={sq} onChange={e=>setSQ(e.target.value)} style={{width:"100%",padding:"3px 5px",background:CO.bg,border:`1px solid ${CO.brd}`,borderRadius:2,color:CO.tx,fontSize:9,outline:"none",fontFamily:"'JetBrains Mono',monospace",boxSizing:"border-box"}}/></div>
        {af&&<div style={{padding:"0 7px 3px"}}><button onClick={clr} style={{background:CO.acc,color:"#fff",border:"none",padding:"1px 5px",borderRadius:2,cursor:"pointer",fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}>Clear</button></div>}
        <Sec t="Typology">{Object.entries(TY).map(([k,v])=>{const c=NODES.filter(n=>n.typology===k).length;return c?<FR key={k} a={fT===k} onClick={()=>setFT(fT===k?null:k)} c={v.c} lb={v.l} ct={c}/>:null;})}</Sec>
        <Sec t="Era">{Object.entries(ERA).map(([k,v])=>{const c=NODES.filter(n=>n.era===k).length;return c?<FR key={k} a={fE===k} onClick={()=>setFE(fE===k?null:k)} lb={v} ct={c}/>:null;})}</Sec>
        <Sec t="Layer">{Object.entries(LAYER).map(([k,v])=>{const c=NODES.filter(n=>n.layer===k).length;return c?<FR key={k} a={fL===k} onClick={()=>setFL(fL===k?null:k)} lb={v} ct={c}/>:null;})}</Sec>
        <Sec t="Relations">{Object.entries(ET).map(([k,v])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:3,marginBottom:1,padding:"0 3px"}}><svg width="12" height="3"><line x1="0" y1="1.5" x2="12" y2="1.5" stroke={v.c} strokeWidth="1.5" strokeDasharray={v.d||"none"}/></svg><span style={{fontSize:7,color:CO.txM}}>{v.l}</span></div>))}</Sec>
        <Sec t="Wikidata"><div style={{padding:"1px 3px",fontSize:8,color:CO.txM}}><span style={{color:CO.gld}}>{wdCt}</span>/{NODES.length} QIDs<div style={{marginTop:2,height:3,background:CO.bg,borderRadius:2,overflow:"hidden"}}><div style={{width:`${(wdCt/NODES.length)*100}%`,height:"100%",background:CO.gld}}/></div></div></Sec>
      </aside>
      <div ref={cRef} style={{flex:1,position:"relative",overflow:"hidden"}}>
        {/* NARRATIVE OVERLAY */}
        {currentStepData&&(<div style={{position:"absolute",top:0,left:0,right:0,zIndex:20,padding:"10px 14px",background:"rgba(11,14,20,0.95)",borderBottom:`1px solid ${CO.brd}`,maxHeight:"40%",overflowY:"auto",backdropFilter:"blur(4px)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:TY[NODES.find(n=>n.id===currentStepData.node)?.typology]?.c||CO.gld}}/>
              <span style={{fontSize:13,fontWeight:600,color:CO.txB}}>{NODES.find(n=>n.id===currentStepData.node)?.label}</span>
              <span style={{fontSize:9,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>{pathStep+1}/{currentPath.steps.length}</span>
            </div>
            <span style={{fontSize:9,color:CO.gld,fontWeight:600}}>{currentPath.title}</span>
          </div>
          <p style={{margin:"0 0 8px",fontSize:12,lineHeight:1.65,color:CO.tx}}>{currentStepData.text}</p>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button disabled={pathStep===0} onClick={()=>setPathStep(s=>s-1)} style={{background:pathStep===0?"transparent":CO.bgH,border:`1px solid ${CO.brd}`,color:pathStep===0?CO.txM:CO.txB,padding:"3px 10px",borderRadius:3,cursor:pathStep===0?"default":"pointer",fontSize:10}}>← Prev</button>
            <button disabled={pathStep>=currentPath.steps.length-1} onClick={()=>setPathStep(s=>s+1)} style={{background:pathStep>=currentPath.steps.length-1?"transparent":CO.gld,border:"none",color:pathStep>=currentPath.steps.length-1?CO.txM:"#0B0E14",padding:"3px 10px",borderRadius:3,cursor:pathStep>=currentPath.steps.length-1?"default":"pointer",fontSize:10,fontWeight:600}}>Next →</button>
            <div style={{flex:1}}/>
            <button onClick={()=>{const n=NODES.find(x=>x.id===currentStepData.node);if(n){setSel(n);setPan(true);}}} style={{background:"none",border:`1px solid ${CO.brd}`,color:CO.txM,padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}>Details →</button>
          </div>
        </div>)}
        <svg ref={svgRef} width={dim.w} height={dim.h} style={{background:CO.bg}}/>
        {hov&&(()=>{const n=NODES.find(x=>x.id===hov);if(!n)return null;return(<div style={{position:"absolute",top:6,left:6,background:"rgba(18,22,31,0.95)",border:`1px solid ${CO.brd}`,borderRadius:3,padding:"4px 7px",maxWidth:240,pointerEvents:"none",zIndex:10}}><div style={{display:"flex",alignItems:"center",gap:4,marginBottom:1}}><div style={{width:5,height:5,borderRadius:"50%",background:TY[n.typology]?.c}}/><span style={{fontWeight:600,color:CO.txB,fontSize:11}}>{n.label}</span></div><div style={{fontSize:8,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>{TY[n.typology]?.l}{n.wikidata?` · ${n.wikidata}`:""}</div></div>);})()}
      </div>
      {pan&&sel&&(<aside style={{width:280,flexShrink:0,borderLeft:`1px solid ${CO.brd}`,background:CO.bgP,overflowY:"auto"}}>
        <div style={{padding:"10px 10px 7px",borderBottom:`1px solid ${CO.brd}`}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><div style={{width:7,height:7,borderRadius:"50%",background:TY[sel.typology]?.c}}/><h2 style={{margin:0,fontSize:14,fontWeight:600,color:CO.txB}}>{sel.label}</h2></div><div style={{fontSize:9,color:TY[sel.typology]?.c,fontFamily:"'JetBrains Mono',monospace"}}>{TY[sel.typology]?.l}</div></div><button onClick={()=>{setSel(null);setPan(false);}} style={{background:"none",border:"none",color:CO.txM,cursor:"pointer",fontSize:14,padding:0}}>×</button></div>
          <div style={{marginTop:3,fontSize:8,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}>{sel.birth&&<span>b.{sel.birth}</span>}{sel.death&&<span> · d.{sel.death}</span>}{sel.birthplace&&<span> · {sel.birthplace}</span>}{sel.hex&&<span style={{color:"#FF8C42"}}> · {sel.hex}</span>}{sel.wikidata?<span> · <a href={`https://www.wikidata.org/wiki/${sel.wikidata}`} target="_blank" rel="noopener" style={{color:CO.gld,textDecoration:"none"}}>{sel.wikidata}</a></span>:<span style={{color:CO.acc}}> · No QID</span>}</div>
          {sel.pearl&&(<div style={{marginTop:3,padding:"3px 5px",background:"rgba(245,230,211,0.08)",borderRadius:2,fontSize:8,fontFamily:"'JetBrains Mono',monospace"}}><span style={{color:"#F5E6D3"}}>Pearl: </span><span style={{color:CO.txB}}>{sel.pearl.status}</span>{sel.pearl.subtype&&<span style={{color:CO.txM}}> · {sel.pearl.subtype}</span>}{sel.pearl.state&&<span style={{color:CO.gld}}> · {sel.pearl.state}</span>}{sel.pearl.note&&<span style={{color:CO.txM,fontStyle:"italic"}}> · {sel.pearl.note}</span>}</div>)}
        </div>
        <div style={{padding:"7px 10px",borderBottom:`1px solid ${CO.brd}`,fontSize:11,lineHeight:1.55}}>{sel.bio}</div>
        {sel.works?.length>0&&(<div style={{padding:"5px 10px",borderBottom:`1px solid ${CO.brd}`}}><ST>Works</ST>{sel.works.map((w,i)=><div key={i} style={{fontSize:9,fontStyle:"italic"}}>{w}</div>)}</div>)}
        {ce.length>0&&(<div style={{padding:"5px 10px",borderBottom:`1px solid ${CO.brd}`}}><ST>Connections ({ce.length})</ST>{ce.map((e,i)=>{const oid=e.source===sel.id?e.target:e.source;const o=NODES.find(n=>n.id===oid);const dir=e.source===sel.id?"→":"←";return(<div key={i} onClick={()=>{const n=NODES.find(x=>x.id===oid);if(n)setSel(n);}} style={{display:"flex",alignItems:"center",gap:3,padding:"1px 0",cursor:"pointer",fontSize:9}}><span style={{color:CO.txM,fontSize:7,width:9}}>{dir}</span><div style={{width:4,height:4,borderRadius:"50%",background:TY[o?.typology]?.c||"#666"}}/><span style={{color:CO.txB,flex:1}}>{o?.label||oid}</span><span style={{color:ET[e.type]?.c||CO.txM,fontSize:7,fontFamily:"'JetBrains Mono',monospace"}}>{ET[e.type]?.l}</span></div>);})}</div>)}
        {sel.citations?.length>0&&(<div style={{padding:"5px 10px"}}><ST>Citations ({sel.citations.length})</ST>{sel.citations.map((c,i)=>(<div key={i} style={{fontSize:9,padding:"2px 0",borderBottom:i<sel.citations.length-1?`1px solid ${CO.brd}`:"none",lineHeight:1.4}}><span style={{color:CO.txB}}>{c.author}</span>{" · "}<span style={{fontStyle:"italic"}}>{c.title}</span>{c.year&&<span style={{color:CO.txM}}> ({c.year})</span>}{c.publisher&&<span style={{color:CO.txM}}> · {c.publisher}</span>}{c.note&&<div style={{fontSize:7,color:CO.txM,fontStyle:"italic"}}>{c.note}</div>}{c.doi&&<div style={{fontSize:7,color:CO.gld,fontFamily:"'JetBrains Mono',monospace"}}>DOI: {c.doi}</div>}</div>))}</div>)}
      </aside>)}
    </div>
    <footer style={{padding:"3px 12px",borderTop:`1px solid ${CO.brd}`,background:CO.bgP,flexShrink:0,display:"flex",justifyContent:"space-between",fontSize:7,color:CO.txM,fontFamily:"'JetBrains Mono',monospace"}}><span>∮=1 · CHA · CC BY 4.0</span><span>PKG · Sharks 2026 · <span style={{color:CO.gldM}}>EA-PKG-01 10.5281/zenodo.15339353 · 02 .15339368 · 03 .15339374 · EA-ARMATURE-01 10.5281/zenodo.19666445</span></span></footer>
  </div>);
}
function Sec({t,children}){return(<div style={{margin:"0 7px",borderTop:"1px solid #2A3040",paddingTop:4,marginTop:4}}><div style={{fontSize:7,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6B7280",marginBottom:2,fontWeight:600}}>{t}</div>{children}</div>);}
function FR({a,onClick,c,lb,ct}){return(<div onClick={onClick} style={{display:"flex",alignItems:"center",gap:3,padding:"1px 3px",borderRadius:2,cursor:"pointer",marginBottom:1,background:a?"#1A1F2B":"transparent"}}>{c&&<div style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0}}/>}<span style={{color:a?"#E8ECF2":"#C8CDD8",flex:1,fontSize:8}}>{lb}</span><span style={{color:"#6B7280",fontSize:7}}>{ct}</span></div>);}
function ST({children}){return(<div style={{fontSize:7,textTransform:"uppercase",letterSpacing:"0.1em",color:"#6B7280",marginBottom:2,fontWeight:600}}>{children}</div>);}
