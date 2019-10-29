'use strict'

const test = require('tape')
const parseTweet = require('../lib/parse-raw-tweet')
const parse = require('../parse')
const {splitSentences, normalizeContent} = require('../lib/utils')
const {useLines} = parse

const opt = {
	formatLine: l => l.name,
	formatStation: s => s.id
}

test('fetch: parseTweet', (t) => {
	const parsed = parseTweet({
		id_str: '1178000391625232384',
		full_text: '#S8 Nacht 28./29.09. ca. 1 Uhr - ca. 6.45 Uhr #Treptower_Park&lt;&gt;#Schönhauser_Allee kein Zugverkehr. Bitte zwischen #Treptower_Park und Schönhauser_Allee die Züge der Linien #S41 und #S42 nutzen.\nInfo: https://t.co/a67QIkpfi6',
		entities: {
			hashtags: [
				{text: 'S8', indices: [0, 3]},
				{text: 'Treptower_Park', indices: [46, 61]},
				{text: 'Schönhauser_Allee', indices: [69, 87]},
				{text: 'Treptower_Park', indices: [120, 135]},
				{text: 'S41', indices: [178, 182]},
				{text: 'S42', indices: [187, 191]}
			],
			user_mentions: [],
			urls: [
				{
					expanded_url: 'https://sbahn.berlin/fahren/fahrplanaenderungen/linien-filter/S8/?tabs=tbc-l4',
					indices: [206, 229]
				}
			]
		}
	})
	t.deepEqual(parsed, {
		id: '1178000391625232384',
		quoted: null,
		text: [
			{ type: 'hashtag', content: 'S8' },
			{
				type: 'plain',
				content: ' Nacht 28./29.09. ca. 1 Uhr - ca. 6.45 Uhr '
			},
			{ type: 'hashtag', content: 'Treptower_Park' },
			{ type: 'plain', content: '&lt;&gt;' },
			{ type: 'hashtag', content: 'Schönhauser_Allee' },
			{ type: 'plain', content: ' kein Zugverkehr. Bitte zwischen ' },
			{ type: 'hashtag', content: 'Treptower_Park' },
			{
				type: 'plain',
				content: ' und Schönhauser_Allee die Züge der Linien '
			},
			{ type: 'hashtag', content: 'S41' },
			{ type: 'plain', content: ' und ' },
			{ type: 'hashtag', content: 'S42' },
			{
				type: 'plain',
				content: ' nutzen.\nInfo: https://t.co/a67QIkpfi6'
			}
		]
	})
	t.end()
})

test('splitSentences', (t) => {
	const boundary = {type: 'sentence-boundary'}

	const split = [
		{type: 'plain', content: 'Bis 06.09. (Fr), ca. 1.30 Uhr zwischen '},
		{type: 'hashtag', content: 'Westkreuz'},
		{type: 'plain', content: ' und '},
		{type: 'hashtag', content: 'Potsdam_Hbf'},
		{type: 'plain', content: ' Ersatzverkehr. Nutzen Sie RE1 und RE7. Infos:'},
		{type: 'url', content: 'https://sbahn.berlin/fahren/s1/?tabs=tbc-l32'}
	].reduce(splitSentences, [])
	t.deepEqual(split, [
		{type: 'plain', content: 'Bis 06.09. (Fr), ca. 1.30 Uhr zwischen '},
		{type: 'hashtag', content: 'Westkreuz'},
		{type: 'plain', content: ' und '},
		{type: 'hashtag', content: 'Potsdam_Hbf'},
		{type: 'plain', content: ' Ersatzverkehr.'}, boundary,
		{type: 'plain', content: ' Nutzen Sie RE1 und RE7.'}, boundary,
		{type: 'plain', content: ' Infos:'},
		{type: 'url', content: 'https://sbahn.berlin/fahren/s1/?tabs=tbc-l32'}
	])

	const split2 = [
		{type: 'plain', content: 'Die S7 verkehrt nur zwischen '},
		{type: 'hashtag', content: 'Ahrensfelde'},
		{type: 'plain', content: ' <> '},
		{type: 'hashtag', content: 'Westkreuz'},
		{type: 'plain', content: '. Der 10-Minutentakt kann nur … angeboten werden.'}
	].reduce(splitSentences, [])
	t.deepEqual(split2, [
		{type: 'plain', content: 'Die S7 verkehrt nur zwischen '},
		{type: 'hashtag', content: 'Ahrensfelde'},
		{type: 'plain', content: ' <> '},
		{type: 'hashtag', content: 'Westkreuz'},
		{type: 'plain', content: '.'}, boundary,
		{type: 'plain', content: ' Der 10-Minutentakt kann nur … angeboten werden.'}
	])

	t.end()
})

test('useLines', (t) => {
	const chunks = [
		{type: 'plain', content: 'Nutzen Sie am 1.3. die Linien 17, RE1 und RE7.'},
		{type: 'sentence-boundary'},
		{type: 'plain', content: ' 123'}
	].map(normalizeContent)

	t.deepEqual(useLines(chunks).map(l => l.name), ['17', 'RE1', 'RE7'])
	t.end()
})

const bisMorgen = {
	id: '1169339350401708032',
	text: [
		{type: 'plain', content: 'Ich wünsche jetzt allen noch einen schönen Abend und verabschiede mich für heute.'}
	]
}
const übergabe = {
	id: '1169222031918927878',
	text: [
		{type: 'plain', content: 'Ich übergebe jetzt an Katrin, Sie wird Euch bis Heute Abend auf dem laufenden halten.  Noch einen schönen Nachmittag, Richard.'}
	]
}
const job = {
	id: '1168829434268409858',
	text: [
		{type: 'plain', content: 'Du willst Dich beruflich weiterentwickeln oder suchst nach neuen Perspektiven? Was auch immer Dich antreibt: Die S-Bahn Berlin ist ein attraktiver Arbeitgeber. Aktuelle Stellenausschreibungen veröffentlichen wir im Karriere-Portal der Deutschen Bahn unter'},
		{type: 'url', content: 'http://karriere.deutschebahn.com'}
	]
}

const notbremse = {
	id: '1169285882949636096',
	text: [
		{type: 'hashtag', content: 'S42'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S45'},
		{type: 'plain', content: ' nach Betätigung der Notbremse in einem Zug in '},
		{type: 'hashtag', content: 'Sonnenallee'},
		{type: 'plain', content: ', kommt es zu Verspätungen und vereinzelten Zugausfällen.'}
	]
}
const notarztSavignyplatz = {
	id: '1169225032700239872',
	text: [
		{type: 'hashtag', content: 'S3'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S5'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S7'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S9'},
		{type: 'plain', content: ' Nach einer ärztliche Versorgung eines Fahrgastes in '},
		{type: 'hashtag', content: 'Savignyplatz'},
		{type: 'plain', content: ' kommt auf den Linien noch zu Verspätungen und Zugausfällen.'}
	]
}

const s7Weichenstörung = {
	id: '1169246704291524608',
	text: [
		{type: 'hashtag', content: 'S7'},
		{type: 'plain', content: ': Wegen einer Weichenstörung in '},
		{type: 'hashtag', content: 'Olympiastadion'},
		{type: 'plain', content: ' verkehrt die S7 nur zwischen '},
		{type: 'hashtag', content: 'Ahrensfelde'},
		{type: 'plain', content: ' <> '},
		{type: 'hashtag', content: 'Westkreuz'},
		{type: 'plain', content: '. Der 10-Minutentakt kann nur zwischen Ahrensfelde <> '},
		{type: 'hashtag', content: 'Charlottenburg'},
		{type: 'plain', content: ' angeboten werden. Von/nach Olympiastadion/Spandau nutzen Sie bitte die Züge der '},
		{type: 'hashtag', content: 'S3'},
		{type: 'plain', content: ' und '},
		{type: 'hashtag', content: 'S9'},
		{type: 'plain', content: '.'}
	]
}
const s7VerkehrtWieder = {
	id: '1169282616715075584',
	quoted: s7Weichenstörung,
	text: [
		{type: 'hashtag', content: 'S7'},
		{type: 'plain', content: ' die Züge verkehren wieder von und nach '},
		{type: 'hashtag', content: 'Olympiastadion'},
		{type: 'plain', content: '. Es kann noch zu Verspätungen und vereinzelten Zugausfällen kommen.'}
	]
}

const plänterwaldPolizeieinsatz = {
	id: '1169232066283806726',
	text: [
		{type: 'hashtag', content: 'S8'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S9'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S85'},
		{type: 'plain', content: ': Wegen eines Polizeieinsatzes entfällt der Verkehrshalt in '},
		{type: 'hashtag', content: 'Plänterwald'},
		{type: 'plain', content: '.'}
		]
}
const plänterwaldPolizeieinsatzVorbei = {
	id: '1169248884859781120',
	quoted: plänterwaldPolizeieinsatz,
	text: [
		{type: 'hashtag', content: 'S8'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S9'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S85'},
		{type: 'plain', content: ': Die Züge halten wieder in '},
		{type: 'hashtag', content: 'Plänterwald'},
		{type: 'plain', content: '. Der Polizeieinsatz ist beendet.'}
	]
}

const ringSignalstörung = {
	id: '1169176924641484800',
	text: [
		{type: 'hashtag', content: 'S45'},
		{type: 'plain', content: ','},
		{type: 'hashtag', content: 'S46'},
		{type: 'plain', content: ','},
		{type: 'hashtag', content: 'S47'},
		{type: 'plain', content: ' Wegen einer Signalstörung in '},
		{type: 'hashtag', content: 'Köllnische_Heide'},
		{type: 'plain', content: ' kommt es auf den Linien zu Verspätungen und Ausfällen. Die '},
		{type: 'hashtag', content: '47'},
		{type: 'plain', content: ' fährt zwischen '},
		{type: 'hashtag', content: 'Schöneweide'},
		{type: 'plain', content: ' und '},
		{type: 'hashtag', content: 'Spindlersfeld'},
		{type: 'plain', content: '.'}
	]
}
const ringSignalstörungVorbei = {
	id: '1169188881276854272',
	quoted: ringSignalstörung,
	text: [
		{type: 'hashtag', content: 'S45'},
		{type: 'plain', content: ','},
		{type: 'hashtag', content: 'S46'},
		{type: 'plain', content: ','},
		{type: 'hashtag', content: 'S47'},
		{type: 'plain', content: ' Die Signalstörung in '},
		{type: 'hashtag', content: 'Köllnische_Heide'},
		{type: 'plain', content: ' ist behoben. Es kommt auf den Linien noch zu Verspätungen.'}
	]
}

const ringStörungAmZug = {
	id: '1168786913664409600',
	text: [
		{type: 'hashtag', content: 'S41'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S42'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S45'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S46'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S47'},
		{type: 'plain', content: ' Wegen einer Störung am Zug in '},
		{type: 'hashtag', content: 'Beusselstraße'},
		{type: 'plain', content: ' kommt es auf den Linien zu Verspätungen und Ausfällen.'}
	]
}
const ringStörungAmZugVorbei = {
	id: '1168791539893624832',
	quoted: ringStörungAmZug,
	text: [
		{type: 'plain', content: 'Die technische Störung am Zug in '},
		{type: 'hashtag', content: 'Beusselstraße'},
		{type: 'plain', content: ' ist behoben. In der Folge kann es noch zu Verspätungen und Ausfällen kommen.'}
	]
}

const ersatzverkehr = {
	id: '1169309399871119361',
	text: [
		{type: 'hashtag', content: 'S7'},
		{type: 'plain', content: ' noch bis 06.09. (Fr), ca. 1.30 Uhr besteht zwischen '},
		{type: 'hashtag', content: 'Westkreuz'},
		{type: 'plain', content: ' und '},
		{type: 'hashtag', content: 'Potsdam_Hbf'},
		{type: 'plain', content: ' Ersatzverkehr mit Bussen. Bitte steigen Sie zwischen S7 und SEV in '},
		{type: 'hashtag', content: 'Messe_Süd'},
		{type: 'plain', content: ' um. Nutzen Sie als Umfahrung auch die Regionalzüge der Linie RE1 und RE7. Nähere Infos:'},
		{type: 'url', content: 'https://sbahn.berlin/fahren/s1/?tabs=tbc-l32'}
	]
}

// todo:
// - https://mobile.twitter.com/SBahnBerlin/status/1168906229919506434
// - https://mobile.twitter.com/SBahnBerlin/status/1168503702451306497
// - https://mobile.twitter.com/SBahnBerlin/status/1168390595230031873
// - "Info: https://t.co/a67QIkpfi6", e.g. in 1178001865998585858
// - 1178001865998585858
// - 1178000391625232384 –> effect: 'no-service'
// - 1177998897110802432 -> cause: 'construction-works'

test('ignores irrelevant messages', (t) => {
	const none = {cause: null, effect: null, affected: [], runsOnlyBetween: null, useLines: [], stations: []}
	t.deepEqual(parse(bisMorgen, opt), {...none, id: bisMorgen.id})
	t.deepEqual(parse(übergabe, opt), {...none, id: übergabe.id})
	t.deepEqual(parse(job, opt), {...none, id: job.id})
	t.end()
})

test('parses "notbremse" messages', (t) => {
	t.deepEqual(parse(notbremse, opt), {
		id: notbremse.id,
		cause: 'emergency-brake',
		effect: 'disruptions',
		affected: ['S42', 'S45'],
		runsOnlyBetween: null,
		stations: ['900000077106'], // S Sonnenallee
		useLines: []
	})
	t.end()
})
test('parses "notarzteinsatz" messages', (t) => {
	t.deepEqual(parse(notarztSavignyplatz, opt), {
		id: notarztSavignyplatz.id,
		cause: 'medical-emergency',
		effect: 'disruptions',
		affected: ['S3', 'S5', 'S7', 'S9'],
		runsOnlyBetween: null,
		// todo: this should actually be 900000024203 (S Savignyplatz)
		stations: ['900000024204'], // Savignyplatz
		useLines: []
	})
	t.end()
})

test('parses "weichenstörung" messages', (t) => {
	t.deepEqual(parse(s7Weichenstörung, opt), {
		id: s7Weichenstörung.id,
		cause: 'switch-failure',
		effect: 'skipped-stops',
		affected: ['S7'],
		runsOnlyBetween: null,
		stations: ['900000025321'], // S Olympiastadion
		// todo: line every 10 minutes between Ahrensfelde & Westkreuz
		useLines: ['S3', 'S9']
	})
	t.end()
})
test('parses "ende der weichenstörung" messages', (t) => {
	t.deepEqual(parse(s7VerkehrtWieder, opt), {
		id: s7VerkehrtWieder.id,
		quoted: parse(s7VerkehrtWieder.quoted, opt),
		cause: null,
		effect: 'normal-operation',
		affected: ['S7'],
		runsOnlyBetween: null,
		stations: [],
		useLines: []
	})
	t.end()
})

test('parses "polizeieinsatz" messages', (t) => {
	t.deepEqual(parse(plänterwaldPolizeieinsatz, opt), {
		id: plänterwaldPolizeieinsatz.id,
		cause: 'police-operation',
		effect: 'skipped-stops',
		affected: ['S8', 'S9', 'S85'],
		runsOnlyBetween: null,
		stations: ['900000191002'], // S Plänterwald
		useLines: []
	})
	t.end()
})
test('parses "ende des polizeieinsatzes" messages', (t) => {
	t.deepEqual(parse(plänterwaldPolizeieinsatzVorbei, opt), {
		id: plänterwaldPolizeieinsatzVorbei.id,
		quoted: parse(plänterwaldPolizeieinsatzVorbei.quoted, opt),
		cause: 'police-operation',
		effect: 'normal-operation',
		affected: ['S8', 'S9', 'S85'],
		runsOnlyBetween: null,
		stations: ['900000191002'], // S Plänterwald
		useLines: []
	})
	t.end()
})

test('parses "signalstörung" messages', (t) => {
	t.deepEqual(parse(ringSignalstörung, opt), {
		id: ringSignalstörung.id,
		cause: 'signalling-failure',
		effect: 'disruptions', // todo: between Schöneweide & Spindlersfeld
		affected: [
			'S45', 'S46', 'S47',
			'47' // the tweet is wrong
		],
		runsOnlyBetween: {
			from: '900000192001', // S Schöneweide
			to: '900000180003', // S Spindlersfeld
			lines: ['47']
		},
		stations: ['900000077155'], // S Köllnische Heide
		useLines: []
	})
	t.end()
})
test('parses "ende der signalstörung" messages', (t) => {
	t.deepEqual(parse(ringSignalstörungVorbei, opt), {
		id: ringSignalstörungVorbei.id,
		quoted: parse(ringSignalstörungVorbei.quoted, opt),
		cause: 'signalling-failure',
		effect: 'normal-operation',
		affected: ['S45', 'S46', 'S47'],
		runsOnlyBetween: null,
		stations: ['900000077155'], // S Köllnische Heide
		useLines: []
	})
	t.end()
})

test('parses "störung am zug" messages', (t) => {
	t.deepEqual(parse(ringStörungAmZug, opt), {
		id: ringStörungAmZug.id,
		cause: 'train-failure',
		effect: 'disruptions',
		affected: ['S41', 'S42', 'S45', 'S46', 'S47'],
		runsOnlyBetween: null,
		stations: ['900000020202'], // S Beusselstr.
		useLines: []
	})
	t.end()
})
test('parses "ende der störung am zug" messages', (t) => {
	t.deepEqual(parse(ringStörungAmZugVorbei, opt), {
		id: ringStörungAmZugVorbei.id,
		quoted: parse(ringStörungAmZugVorbei.quoted, opt),
		cause: 'train-failure',
		effect: 'normal-operation',
		affected: [], // todo: pick up lines from quoted event
		runsOnlyBetween: null,
		stations: ['900000020202'], // S Beusselstr.
		useLines: []
	})
	t.end()
})

test('parses "ersatzverkehr" messages', (t) => {
	t.deepEqual(parse(ersatzverkehr, opt), {
		id: ersatzverkehr.id,
		cause: null,
		effect: 'replacement-service',
		affected: ['S7'],
		runsOnlyBetween: null,
		useLines: ['RE1', 'RE7'],
		stations: []
		// todo: between Westkreuz & Potsdam Hbf
	})
	t.end()
})
