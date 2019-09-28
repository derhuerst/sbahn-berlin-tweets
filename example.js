'use strict'

const parse = require('./parse')

console.log(parse({
	id: '1169285882949636096',
	text: [
		{type: 'hashtag', content: 'S42'},
		{type: 'plain', content: ', '},
		{type: 'hashtag', content: 'S45'},
		{type: 'plain', content: ' nach Betätigung der Notbremse in einem Zug in '},
		{type: 'hashtag', content: 'Sonnenallee'},
		{type: 'plain', content: ', kommt es zu Verspätungen und vereinzelten Zugausfällen.'}
	]
}))
