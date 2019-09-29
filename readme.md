# sbahn-berlin-tweets

**Fetch & parse [`@SBahnBerlin`](https://mobile.twitter.com/SBahnBerlin) tweets on the operating status of [S-Bahn Berlin](https://en.wikipedia.org/wiki/Berlin_S-Bahn).** Caveats:

- It guesses lines and stations just by their name. This is brittle.
- It relies on specific phrases & keywords commonly used by the `SBahnBerlin` twitter account.

[![npm version](https://img.shields.io/npm/v/sbahn-berlin-tweets.svg)](https://www.npmjs.com/package/sbahn-berlin-tweets)
[![build status](https://api.travis-ci.org/derhuerst/sbahn-berlin-tweets.svg?branch=master)](https://travis-ci.org/derhuerst/sbahn-berlin-tweets)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/sbahn-berlin-tweets.svg)
![minimum Node.js version](https://img.shields.io/node/v/berlin-postal-code-areas.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installation

```shell
npm install sbahn-berlin-tweets
```


## Usage

```js
const parse = require('parse-sbahn-berlin-tweets/parse')

console.log(parse({
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
}))
```

```js
{
	cause: 'switch-failure',
	effect: 'skipped-stops',
	affected: [
		// from the `vbb-lines` npm package
		{id: '10162_109', name: 'S7'}
	],
	stations: [
		// from the `vbb-stations` npm package
		{id: '900000025321', name: 'S Olympiastadion'}
	],
	useLines: [
		// from the `vbb-lines` npm package
		{id: '10148_109', name: 'S3'},
		{id: '10170_109', name: 'S9'}
	],
	runsOnlyBetween: null
}
```


## Related

- [`augment-vbb-hafas`](https://github.com/derhuerst/augment-vbb-hafas) – Augment [VBB HAFAS](https://npmjs.com/package/vbb-hafas) responses with realtime data from other channels.
- [`vbb-disruptions`](https://github.com/derhuerst/vbb-disruptions) – Disruptions in VBB public transport.


## Contributing

If you have a question or need support using `sbahn-berlin-tweets`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/sbahn-berlin-tweets/issues).
