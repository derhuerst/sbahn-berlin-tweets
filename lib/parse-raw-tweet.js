'use strict'

const last = require('lodash/last')
const sortBy = require('lodash/sortBy')
const first = require('lodash/first')

const parseHashtag = ({text, indices}) => {
	const res = {type: 'hashtag', content: text}
	Object.defineProperty(res, 'iStart', {value: indices[0]})
	Object.defineProperty(res, 'iEnd', {value: indices[1]})
	return res
}
const parseUrl = ({expanded_url: url, indices}) => {
	const res = {type: 'url', content: url}
	Object.defineProperty(res, 'iStart', {value: indices[0]})
	Object.defineProperty(res, 'iEnd', {value: indices[1]})
	return res
}

const urlToTweetId = (url) => {
	const {hostname: host, pathname: path} = new URL(url)
	const lSlug = last(path.split('/').map(decodeURIComponent))
	return host === 'twitter.com' && /^\d{15,}$/g.test(lSlug) && lSlug
}

const parseChunks = (text, hashtags, urls) => {
	const refs = sortBy([...hashtags, urls], 'offset')
	const plain = (content) => ({type: 'plain', content})
	return refs
	.reduce(({i, chunks}, ref) => {
		if (i < ref.iStart) return {
			i: ref.iEnd,
			chunks: [...chunks, plain(text.slice(i, ref.iStart)), ref]
		}
		if (i === ref.iStart) return {
			i: ref.iEnd,
			chunks: [...chunks, ref]
		}
		return {
			i: text.length - 1,
			chunks: [...chunks, plain(text.slice(i))]
		}
	}, {i: 0, chunks: []})
	.chunks
}

const parseRawTweet = ({entities, id_str: id, full_text}) => {
	const hashtags = entities.hashtags.map(parseHashtag)
	const urls = entities.urls.map(parseUrl)
	return {
		id,
		quoted: first(urls) && urlToTweetId(first(urls).content) || null,
		text: parseChunks(full_text, hashtags, urls)
	}
}

module.exports = parseRawTweet
