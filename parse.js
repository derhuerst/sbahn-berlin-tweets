'use strict'

const uniqBy = require('lodash/uniqBy')
const slugg = require('slugg')
const {
	splitSentences,
	normalizeContent,
	stemContent,
	isPlainWithNormalized,
	isSentenceBoundary, isNotSentenceBoundary,
	sentenceIndicesAt, sentenceAt, withoutSentenceAt, removeSentences,
	findLine,
	findLineHashtags, findStationHashtags
} = require('./lib/utils')

const isStation = ({type, station}) => type === 'hashtag' && !!station

const isPlainWithErsatzverkehr = isPlainWithNormalized(/(\s|^)ersatzverkehr(\s|$)/g)
const findReplacementService = (chunks) => {
	const i = chunks.findIndex(isPlainWithErsatzverkehr)
	if (i < 0) return null

	const stations = sentenceAt(chunks, i)
	.filter(isStation)
	.map(({station}) => station)

	if (stations.length !== 2) return null // todo
	return {from: stations[0], to: stations[1]}
}

const cause = (chunks) => {
	const text = chunks.filter(({type}) => type === 'plain')
	const n = ' ' + text.map(({normalized}) => normalized).join(' ') + ' '
	const s = ' ' + text.map(({stemmed}) => stemmed).join(' ') + ' '

	if (n.includes(' notbremse ')) return 'emergency-brake'
	if (s.includes(' arztlich ')) return 'medical-emergency'
	if (n.includes(' weichenstorung ')) return 'switch-failure'
	if (n.includes(' signalstorung ')) return 'signalling-failure'
	if (n.includes(' storung am zug ')) return 'train-failure'
	if (s.includes(' polizeieinsatz ')) return 'police-operation'
	return null
}

const includesPair = (a, b, list) => list.indexOf(a) >= 0 && list[list.indexOf(a) + 1] === b
const effect = (chunks) => {
	if (findReplacementService(chunks)) return 'replacement-service'

	const text = chunks.filter(({type}) => type === 'plain')
	const n = ' ' + text.map(({normalized}) => normalized).join(' ') + ' '
	const s = ' ' + text.map(({stemmed}) => stemmed).join(' ') + ' '

	if (n.includes(' behoben ')) return 'normal-operation'
	const _s = s.split(/\s+/)
	if (includesPair('verkehr', 'wied', _s) || includesPair('halt', 'wied', _s)) {
		return 'normal-operation'
	}
	if (n.includes(' entfallt ') && n.includes(' verkehrshalt ')) return 'skipped-stops'
	if (n.includes(' verkehrt ') && n.includes(' nur zwischen ')) return 'skipped-stops'
	if (n.includes(' zugausfallen ') || n.includes(' ausfallen ')) return 'disruptions'
	return null
}

const isUseLinesOrPleaseChangeSentence = (chunk) => {
	const {type, normalized} = chunk
	if (type === 'plain' && /steigen\s+sie\s/.test(normalized)) return true
	return isUseLinesSentence(chunk)
}
const affectedLines = (chunks) => {
	// remove "use lines" & "please change" sentences
	chunks = removeSentences(chunks, isUseLinesOrPleaseChangeSentence)

	const lines = chunks
	.filter(({type, line}) => type === 'hashtag' && !!line)
	.map(({line}) => line)
	return uniqBy(lines, 'id')
}

const isUseLinesSentence = ({type, normalized}) => {
	return type === 'plain' && /nutzen\s+sie\s/.test(normalized)
}

const formatLine = l => ['line', l.name]
const formatStation = s => slugg(s.name) // todo: ID
const parse = ({text}) => {
	const chunks = text
	.reduce(splitSentences, [])
	.map(normalizeContent)
	.map(stemContent)
	.map(findLineHashtags)
	.map(findStationHashtags)
	// console.error(chunks)

	return {
		cause: cause(chunks),
		effect: effect(chunks),
		affected: affectedLines(chunks).map(formatLine)
	}
}

module.exports = fetch
