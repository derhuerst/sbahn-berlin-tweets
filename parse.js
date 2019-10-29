'use strict'

const uniqBy = require('lodash/uniqBy')
const takeWhile = require('lodash/takeWhile')
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

	const isWeird = stations.length !== 2 // todo
	return {
		from: isWeird ? stations[0] : null,
		to: isWeird ? stations[1] : null
	}
}

const runsOnlyBetween = (chunks) => {
	const i = chunks.findIndex((chunk, i) => {
		if (!isPlainWithNormalized(/fahrt zwischen\s*$/g)(chunk)) return false
		return !sentenceAt(chunks, i).some(isPlainWithErsatzverkehr)
	})
	if (i < 0) return null

	const lines = sentenceAt(chunks, i)
	.filter(({type, line}) => type === 'hashtag' && !!line)
	.map(({line}) => line)

	const restOfSentence = takeWhile(chunks.slice(i), isNotSentenceBoundary)
	const stations = restOfSentence
	.filter(isStation)
	.map(({station}) => station)

	if (stations.length !== 2) return null // todo
	return {
		lines,
		from: stations[0],
		to: stations[1]
	}
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
	if (n.includes(' bauarbeiten ')) return 'construction-works'
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

const affectedStations = (chunks) => {
	// remove "use lines" & "please change" sentences
	chunks = removeSentences(chunks, isUseLinesOrPleaseChangeSentence)

	const stations = chunks
	.filter(({type, station}, i, chunks) => {
		if (type !== 'hashtag' || !station) return false
		const {type: prevType, normalized: prevNormalized} = chunks[i - 1] || {}
		return prevType === 'plain' && /in\s*$/g.test(prevNormalized)
	})
	.map(({station}) => station)
	return uniqBy(stations, 'id')
}

const isUseLinesSentence = ({type, normalized}) => {
	return type === 'plain' && /(^|\s)nutzen($|\s)/g.test(normalized)
}
const useLines = (chunks) => {
	const useLines = chunks.flatMap((chunk, i) => {
		return isUseLinesSentence(chunk) ? sentenceAt(chunks, i) : []
	})

	return useLines.reduce((lines, chunk) => {
		if (chunk.type === 'hashtag' && chunk.line) return [...lines, chunk.line]
		if (chunk.type === 'plain') {
			const lineRegex = /(?<=\s)[A-Z]*\d+(?=[\s,]|\.?$)/g
			const newLines = Array.from(chunk.content.matchAll(lineRegex))
			.filter(t => !!findLine(t))
			.map(t => findLine(t))
			return [...lines, ...newLines]
		}
		return lines
	}, [])
}

const defaults = {
	formatLine: l => ({id: l.id, name: l.name}),
	formatStation: s => ({id: s.id, name: s.name})
}
const parse = ({id, quoted, text}, opt = {}) => {
	const {formatLine, formatStation} = {...defaults, ...opt}

	const chunks = text
	.reduce(splitSentences, [])
	.map(normalizeContent)
	.map(stemContent)
	.map(findLineHashtags)
	.map(findStationHashtags)

	const between = runsOnlyBetween(chunks)
	const res = {
		id,
		cause: cause(chunks),
		effect: effect(chunks),
		affected: affectedLines(chunks).map(formatLine),
		stations: affectedStations(chunks).map(formatStation),
		useLines: useLines(chunks).map(formatLine),
		runsOnlyBetween: between && {
			from: formatStation(between.from),
			to: formatStation(between.to),
			lines: between.lines.map(formatLine)
		}
	}

	if (quoted) res.quoted = parse(quoted, opt)

	return res
}

parse.useLines = useLines
module.exports = parse
