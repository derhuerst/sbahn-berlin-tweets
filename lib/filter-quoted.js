'use strict'

const filterQuoted = (tweets) => {
	const quoted = tweets.filter(t => t.quoted).map(t => t.quoted)
	return tweets.filter(t => !quoted.includes(t))
}

module.exports = filterQuoted
