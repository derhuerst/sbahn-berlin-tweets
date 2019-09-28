'use strict'

const test = require('tape')
const parse = require('..')
const {splitSentences, normalizeContent} = require('../lib/utils')
const {useLines} = parse

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

test('ignores irrelevant messages', (t) => {
	const none = {cause: null, effect: null, affected: [], runsOnlyBetween: null, useLines: [], stations: []}
	t.deepEqual(parse(bisMorgen), none)
	t.deepEqual(parse(übergabe), none)
	t.deepEqual(parse(job), none)
	t.end()
})

test('parses "notbremse" messages', (t) => {
	t.deepEqual(parse(notbremse), {
		cause: 'emergency-brake',
		effect: 'disruptions',
		affected: [
			['line', 'S42'],
			['line', 'S45']
		],
		runsOnlyBetween: null,
		stations: ['s-sonnenallee'], // todo: use ID
		useLines: []
	})
	t.end()
})
test('parses "notarzteinsatz" messages', (t) => {
	t.deepEqual(parse(notarztSavignyplatz), {
		cause: 'medical-emergency',
		effect: 'disruptions',
		affected: [
			['line', 'S3'],
			['line', 'S5'],
			['line', 'S7'],
			['line', 'S9']
		],
		runsOnlyBetween: null,
		stations: ['savignyplatz'], // todo: use ID
		useLines: []
	})
	t.end()
})

test('parses "weichenstörung" messages', (t) => {
	t.deepEqual(parse(s7Weichenstörung), {
		cause: 'switch-failure',
		effect: 'skipped-stops',
		affected: [
			['line', 'S7']
		],
		runsOnlyBetween: null,
		stations: ['s-olympiastadion'], // todo: use ID
		// todo: line every 10 minutes between Ahrensfelde & Westkreuz
		useLines: [
			['line', 'S3'],
			['line', 'S9']
		]
	})
	t.end()
})
test('parses "ende der weichenstörung" messages', (t) => {
	t.deepEqual(parse(s7VerkehrtWieder), {
		cause: null,
		effect: 'normal-operation',
		affected: [
			['line', 'S7']
		],
		runsOnlyBetween: null,
		stations: [],
		useLines: []
	})
	t.end()
})

test('parses "polizeieinsatz" messages', (t) => {
	t.deepEqual(parse(plänterwaldPolizeieinsatz), {
		cause: 'police-operation',
		effect: 'skipped-stops',
		affected: [
			['line', 'S8'],
			['line', 'S9'],
			['line', 'S85']
		],
		runsOnlyBetween: null,
		stations: ['s-planterwald'], // todo: use ID
		useLines: []
	})
	t.end()
})
test('parses "ende des polizeieinsatzes" messages', (t) => {
	t.deepEqual(parse(plänterwaldPolizeieinsatzVorbei), {
		cause: 'police-operation',
		effect: 'normal-operation',
		affected: [
			['line', 'S8'],
			['line', 'S9'],
			['line', 'S85']
		],
		runsOnlyBetween: null,
		stations: ['s-planterwald'],
		useLines: []
	})
	t.end()
})

test('parses "signalstörung" messages', (t) => {
	t.deepEqual(parse(ringSignalstörung), {
		cause: 'signalling-failure',
		effect: 'disruptions', // todo: between Schöneweide & Spindlersfeld
		affected: [
			['line', 'S45'],
			['line', 'S46'],
			['line', 'S47'],
			['line', '47'] // the tweet is wrong
		],
		runsOnlyBetween: {
			from: 's-schoneweide',
			to: 's-spindlersfeld',
			lines: [['line', '47']]
		},
		stations: ['s-kollnische-heide'], // todo: use ID
		useLines: []
	})
	t.end()
})
test('parses "ende der signalstörung" messages', (t) => {
	t.deepEqual(parse(ringSignalstörungVorbei), {
		cause: 'signalling-failure',
		effect: 'normal-operation',
		affected: [
			['line', 'S45'],
			['line', 'S46'],
			['line', 'S47']
		],
		runsOnlyBetween: null,
		stations: ['s-kollnische-heide'],
		useLines: []
	})
	t.end()
})

test('parses "störung am zug" messages', (t) => {
	t.deepEqual(parse(ringStörungAmZug), {
		cause: 'train-failure',
		effect: 'disruptions',
		affected: [
			['line', 'S41'],
			['line', 'S42'],
			['line', 'S45'],
			['line', 'S46'],
			['line', 'S47']
		],
		runsOnlyBetween: null,
		stations: ['s-beusselstr'], // todo: use ID
		useLines: []
	})
	t.end()
})
test('parses "ende der störung am zug" messages', (t) => {
	t.deepEqual(parse(ringStörungAmZugVorbei), {
		cause: 'train-failure',
		effect: 'normal-operation',
		affected: [], // todo: pick up lines from quoted event
		runsOnlyBetween: null,
		stations: ['s-beusselstr'],
		useLines: []
	})
	t.end()
})

test('parses "ersatzverkehr" messages', (t) => {
	t.deepEqual(parse(ersatzverkehr), {
		cause: null,
		effect: 'replacement-service',
		affected: [
			['line', 'S7']
		],
		runsOnlyBetween: null,
		useLines: [
			['line', 'RE1'],
			['line', 'RE7']
		],
		stations: []
		// todo: between Westkreuz & Potsdam Hbf
	})
	t.end()
})
