'use strict'

const rawLines = require('vbb-lines/data.json')
const slugg = require('slugg')
const findStations = require('vbb-find-stations')
const {Stemmer, Languages: {German}} = require('multilingual-stemmer')

const splitSentences = (chunks, chunk) => {
	if (chunk.type !== 'plain') return [...chunks, chunk]
	const c = chunk.content
	const matches = Array.from(c.matchAll(/(?<=[^\d\.]\w+|^)[.;?!](?=\s)/g))

	const newChunks = []
	let i = 0
	for (const m of matches) {
		if (/\sca/.test(c.slice(m.index - 3, m.index))) continue
		const endI = m.index + m[0].length
		newChunks.push(
			{type: 'plain', content: c.slice(i, endI)},
			{type: 'sentence-boundary'}
		)
		i = endI
	}
	if (c.slice(i)) newChunks.push({type: 'plain', content: c.slice(i)})
	return [...chunks, ...newChunks]
}

const normalizeContent = (chunk) => {
	if (chunk.type === 'hashtag' || chunk.type === 'plain') {
		return {
			...chunk,
			normalized: slugg(chunk.content).replace(/-/g, ' ')
		}
	}
	return chunk
}

const stemmer = new Stemmer(German)
const stem = (normalizedText) => {
	return normalizedText
	.split(' ')
	.map(word => stemmer.stem(word))
	.join(' ')
}
const stemContent = (chunk) => {
	if (chunk.type === 'plain' || chunk.type === 'hashtag') {
		return {...chunk, stemmed: stem(chunk.normalized)}
	}
	return chunk
}

const isPlainWithNormalized = (pattern) => (chunk) => {
	return chunk.type === 'plain' && new RegExp(pattern).test(chunk.normalized)
}

const isSentenceBoundary = ({type}) => type === 'sentence-boundary'
const isNotSentenceBoundary = c => !isSentenceBoundary(c)

const sentenceIndicesAt = (chunks, i) => {
	const from = chunks.slice(0, i).reverse().findIndex(isSentenceBoundary)
	const to = chunks.slice(i + 1).findIndex(isSentenceBoundary)
	return [
		from < 0 ? 0 : i - from,
		to < 0 ? chunks.length - 1 : i + 1 + to
	]
}
const sentenceAt = (chunks, i) => {
	const [iFrom, iTo] = sentenceIndicesAt(chunks, i)
	return chunks.slice(iFrom, iTo)
}
const withoutSentenceAt = (chunks, i) => {
	const [iFrom, iTo] = sentenceIndicesAt(chunks, i)
	return chunks = [...chunks.slice(0, iFrom), ...chunks.slice(iTo + 1)]
}
const removeSentences = (chunks, predicate) => {
	while (true) {
		const i = chunks.findIndex(predicate)
		if (i < 0) break
		chunks = withoutSentenceAt(chunks, i)
	}
	return chunks
}

const linesBySlug = Object.create(null)
for (const l of rawLines) linesBySlug[slugg(l.name)] = l
const findLine = (text) => {
	const t = slugg(text).replace(/\s+/, '')
	return t in linesBySlug ? linesBySlug[t] : null
}

const findLineHashtags = (chunk) => {
	const l = chunk.type === 'hashtag' && findLine(chunk.normalized)
	return l ? {...chunk, line: l} : chunk
}

const findStationHashtags = (chunk) => {
	const c = chunk.type === 'hashtag' && chunk.content.replace(/_/g, ' ')
	const s = c && findStations(c)[0]
	return s ? {...chunk, station: s} : chunk
}

module.exports = {
	splitSentences,
	normalizeContent,
	stemContent,
	isPlainWithNormalized,
	isSentenceBoundary, isNotSentenceBoundary,
	sentenceIndicesAt, sentenceAt, withoutSentenceAt, removeSentences,
	findLine,
	findLineHashtags, findStationHashtags
}
