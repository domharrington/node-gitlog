# node-gitlog

Git log parser for Node.JS

[![build status](https://api.travis-ci.org/domharrington/node-gitlog.svg)](http://travis-ci.org/domharrington/node-gitlog)
[![dependency status](https://david-dm.org/domharrington/node-gitlog.svg)](https://david-dm.org/domharrington/node-gitlog)

## Installation

```sh
npm install gitlog --save
```

## Usage

```js
const gitlog = require("gitlog").default;

const options = {
  repo: __dirname + "/test-repo-folder",
  number: 20,
  author: "Dom Harrington",
  fields: ["hash", "abbrevHash", "subject", "authorName", "authorDateRel"],
  execOptions: { maxBuffer: 1000 * 1024 },
};

// Synchronous
const commits = gitlog(options);
console.log(commits);

// Asynchronous (with Callback)
gitlog(options, function (error, commits) {
  // Commits is an array of commits in the repo
  console.log(commits);
});

const { gitlogPromise } = require("gitlog");

// Asynchronous (with Promise)
gitlogPromise(options)
  .then((commits) => console.log(commits))
  .catch((err) => console.log(err));
```

`gitlog` comes with full typescript support!

```ts
import gitlog, { GitlogOptions } from "gitlog";

// Option 1: Just use the function, returned commit type has specified fields
gitlog({
  repo: "foo",
  fields: ["subject", "authorName", "authorDate"],
});

// Option 2: Use Options type to create options
const options: GitlogOptions<"subject" | "authorName" | "authorDate"> = {
  repo: "foo",
  fields: ["subject", "authorName", "authorDate"],
};

gitlog(options);

// Option 3: Typescript Magic
const options = {
  repo: "foo",
  fields: ["subject", "authorName", "authorDate"] as const,
};

gitlog(options);

// NOT SUPPORTED: Without "as const" gitlog can't create a good return type
const options = {
  repo: "foo",
  fields: ["subject", "authorName", "authorDate"],
};

gitlog(options);
```

## Options

See [git log](http://git-scm.com/docs/git-log)

### repo

The location of the repo, required field.

### number

The number of commits to return, defaults to 10.

### since/after

Show commits more recent than a specific date.

### until/before

Show commits older than a specific date.

### author/committer

Limit the commits output to ones with author/committer header lines that match the specified pattern.

### nameStatus

Below fields was returned from the log:

- files - changed files names (array)
- status - changed files status (array)

This option is enabled by default.

### findCopiesHarder

Much more likely to set status codes to 'C' if files are exact copies of each other.

This option is disabled by default.

### includeMergeCommitFiles

Pass the `-m` option to includes files in a merge commit.

This option is disabled by default.

### all

Find commits on all branches instead of just on the current one.

This option is disabled by default.

### branch ([revision range](https://git-scm.com/docs/git-log#git-log-ltrevisionrangegt))

Show only commits in the specified branch or revision range.

By default uses the current branch and defaults to `HEAD` (i.e. the whole history leading to the current commit).

### fileLineRange

Optional field for getting only the commits that affected a specific line range of a given file.

### file

Optional file filter for the `git log` command

### execOptions

Type: `Object`

Specify some options to be passed to the [.exec()](http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) method:

- `cwd` String _Current working directory of the child process_
- `env` Object _Environment key-value pairs_
- `setsid` Boolean
- `encoding` String _(Default: 'utf8')_
- `timeout` Number _(Default: 0)_
- `maxBuffer` Number _(Default: 200\*1024)_
- `killSignal` String _(Default: 'SIGTERM')_

### optional fields

An array of fields to return from the log, here are the possible options:

- `hash` - the long hash of the commit e.g. 7dd0b07625203f69cd55d779d873f1adcffaa84a
- `abbrevHash` - the abbreviated commit hash e.g. 7dd0b07
- `treeHash` - the tree hash of the commit
- `abbrevTreeHash` - the abbreviated commit hash
- `parentHashes` - the parent hashes
- `abbrevParentHashes` - the abbreviated parent hashes
- `authorName` - author name of the commit
- `authorEmail` - author email of the commit
- `authorDate` - author date of the commit
- `authorDateRel` - relative author date of the commit
- `committerName` - committer name
- `committerEmail` - committer email
- `committerDate` - committer date
- `committerDateRel` - relative committer date
- `subject` - commit message (first line)
- `body` - commit body
- `rawBody` - raw body (subject + body)
- `tag` - raw tag information of commit

Defaults to 'abbrevHash', 'hash', 'subject' and 'authorName'.

## How it works

This module works by executing a child process (using `child_process.exec()`) to the `git` executable, then parsing the stdout into commits. This is done using the `--pretty` command line option which allows you to provide a custom formatter to `git log`. To enable easy parsing the format is delimited by a tab (`\t`) character.

## Example

The following is an example of what a parsed commit might look like.

```json
{
  "hash": "6a7ef5e3b3d9c77743140443c8f9e792b0715721",
  "abbrevHash": "6a7ef5e",
  "treeHash": "f1bf51b15b48a00c33727f364afef695029864c0",
  "abbrevTreeHash": "f1bf51b",
  "parentHashes": "cfe06dbdb8d0a193640977e016a04678f8f3b04f",
  "abbrevParentHashes": "cfe06dbdb8d0a193640977e016a04678f8f3b04f",
  "authorName": "Dom Harrington",
  "authorEmail": "dom@harringtonxxxxx",
  "authorDate": "2015-04-09 09:39:23 +0100",
  "authorDateRel": "6 days ago",
  "committerName": "Dom Harrington",
  "committerEmail": "dom@harringtonxxxxx",
  "committerDate": "Thu Apr 9 09:39:23 2015 +0100",
  "committerDateRel": "6 days ago",
  "subject": "1.0.0",
  "status": ["M"],
  "files": ["package.json"]
}
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/domharrington"><img src="https://avatars0.githubusercontent.com/u/848223?v=4?s=100" width="100px;" alt=""/><br /><sub><b>domharrington</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=domharrington" title="Code">💻</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=domharrington" title="Documentation">📖</a> <a href="#example-domharrington" title="Examples">💡</a> <a href="#ideas-domharrington" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://hipstersmoothie.com"><img src="https://avatars3.githubusercontent.com/u/1192452?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Andrew Lisowski</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=hipstersmoothie" title="Code">💻</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=hipstersmoothie" title="Documentation">📖</a> <a href="#infra-hipstersmoothie" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-hipstersmoothie" title="Maintenance">🚧</a></td>
    <td align="center"><a href="http://metaodi.ch"><img src="https://avatars1.githubusercontent.com/u/538415?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Stefan Oderbolz</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/issues?q=author%3Ametaodi" title="Bug reports">🐛</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=metaodi" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/palortoff"><img src="https://avatars1.githubusercontent.com/u/10258543?v=4?s=100" width="100px;" alt=""/><br /><sub><b>palortoff</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/issues?q=author%3Apalortoff" title="Bug reports">🐛</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=palortoff" title="Code">💻</a></td>
    <td align="center"><a href="https://malys.github.io/"><img src="https://avatars1.githubusercontent.com/u/463016?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Malys</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/issues?q=author%3Amalys" title="Bug reports">🐛</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=malys" title="Code">💻</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=malys" title="Documentation">📖</a></td>
    <td align="center"><a href="http://CodeGymSleep.com/"><img src="https://avatars3.githubusercontent.com/u/6986032?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mike Mellor</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=mikemellor11" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/hmedney"><img src="https://avatars3.githubusercontent.com/u/1221751?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hunter Medney</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=hmedney" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Gilwyad"><img src="https://avatars3.githubusercontent.com/u/1919041?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Peter Baranyi</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=Gilwyad" title="Code">💻</a> <a href="https://github.com/domharrington/node-gitlog/issues?q=author%3AGilwyad" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://twitter.com/B_Blackwo"><img src="https://avatars0.githubusercontent.com/u/7598058?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Benjamin Blackwood</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=BBlackwo" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Asheboy"><img src="https://avatars1.githubusercontent.com/u/1822529?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ash Summers</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=Asheboy" title="Code">💻</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=Asheboy" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/007design"><img src="https://avatars0.githubusercontent.com/u/1998403?v=4?s=100" width="100px;" alt=""/><br /><sub><b>007design</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=007design" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tobaccoplaybook"><img src="https://avatars2.githubusercontent.com/u/21124900?v=4?s=100" width="100px;" alt=""/><br /><sub><b>tobaccoplaybook</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=tobaccoplaybook" title="Code">💻</a></td>
    <td align="center"><a href="http://nicola.io"><img src="https://avatars1.githubusercontent.com/u/1424850?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nicola</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=nicola" title="Code">💻</a></td>
    <td align="center"><a href="http://bluelovers.net"><img src="https://avatars0.githubusercontent.com/u/167966?v=4?s=100" width="100px;" alt=""/><br /><sub><b>bluelovers</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=bluelovers" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/afram"><img src="https://avatars0.githubusercontent.com/u/2238230?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Marwan Butrous</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=afram" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/FishOrBear"><img src="https://avatars0.githubusercontent.com/u/19372111?v=4?s=100" width="100px;" alt=""/><br /><sub><b>FishOrBear</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=FishOrBear" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Asjidkalam"><img src="https://avatars1.githubusercontent.com/u/16708391?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Asjid Kalam</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=Asjidkalam" title="Code">💻</a></td>
    <td align="center"><a href="https://418sec.com/"><img src="https://avatars0.githubusercontent.com/u/55323451?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jamie Slome</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=JamieSlome" title="Code">💻</a></td>
    <td align="center"><a href="https://huntr.dev/"><img src="https://avatars0.githubusercontent.com/u/61279246?v=4?s=100" width="100px;" alt=""/><br /><sub><b>huntr-helper</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=huntr-helper" title="Code">💻</a></td>
    <td align="center"><a href="https://salmonmode.github.io/"><img src="https://avatars3.githubusercontent.com/u/13908130?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Chris NeJame</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=SalmonMode" title="Documentation">📖</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=SalmonMode" title="Tests">⚠️</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=SalmonMode" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ron-checkmarx"><img src="https://avatars2.githubusercontent.com/u/67099202?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ron</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=ron-checkmarx" title="Tests">⚠️</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=ron-checkmarx" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://www.linkedin.com/in/juanignaciogarzon/"><img src="https://avatars.githubusercontent.com/u/9467722?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Juan Ignacio Garzón</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=jigarzon" title="Documentation">📖</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=jigarzon" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/vlovich"><img src="https://avatars.githubusercontent.com/u/201287?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Vitali Lovich</b></sub></a><br /><a href="https://github.com/domharrington/node-gitlog/commits?author=vlovich" title="Tests">⚠️</a> <a href="https://github.com/domharrington/node-gitlog/commits?author=vlovich" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
