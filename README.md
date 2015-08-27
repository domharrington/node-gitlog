# node-gitlog

Git log parser for Node.JS

[![build status](https://api.travis-ci.org/domharrington/node-gitlog.svg)](http://travis-ci.org/domharrington/node-gitlog)
[![dependency status](https://david-dm.org/domharrington/node-gitlog.svg)](https://david-dm.org/domharrington/node-gitlog)

## Installation

     npm install gitlog --save

## Usage

```js
var gitlog = require('gitlog')
  , options =
    { repo: __dirname + '/test-repo-folder'
    , number: 20
    , author: 'Dom Harrington'
    , fields:
      [ 'hash'
      , 'abbrevHash'
      , 'subject'
      , 'authorName'
      , 'authorDateRel'
      ]
    }

gitlog(options, function(error, commits) {
  // Commits is an array of commits in the repo
  console.log(commits)
})
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

### optional fields
An array of fields to return from the log, here are the possible options:

- hash - the long hash of the commit e.g. 7dd0b07625203f69cd55d779d873f1adcffaa84a
- abbrevHash - the abbreviated commit hash e.g. 7dd0b07
- treeHash - the tree hash of the commit
- abbrevTreeHash - the abbreviated commit hash
- parentHashes - the parent hashes
- abbrevParentHashes - the abbreviated parent hashes
- authorName - author name of the commit
- authorEmail - author email of the commit
- authorDate - author date of the commit
- authorDateRel - relative author date of the commit
- committerName - committer name
- committerEmail - committer email
- committerDate - committer date
- committerDateRel - relative committer date
- subject - commit message (first line)
- body - full commit message


Defaults to 'abbrevHash', 'hash', 'subject' and 'authorName'.

## How it works

This module works by executing a child process (using `child_process.exec()`) to the `git` executable, then parsing the stdout into commits. This is done using the `--pretty` command line option which allows you to provide a custom formatter to `git log`. To enable easy parsing the format is delimited by a tab (`\t`) character.

## Example
```javascript
  { hash: '6a7ef5e3b3d9c77743140443c8f9e792b0715721',
    abbrevHash: '6a7ef5e',
    treeHash: 'f1bf51b15b48a00c33727f364afef695029864c0',
    abbrevTreeHash: 'f1bf51b',
    parentHashes: 'cfe06dbdb8d0a193640977e016a04678f8f3b04f',
    abbrevParentHashes: 'cfe06dbdb8d0a193640977e016a04678f8f3b04f',
    authorName: 'Dom Harrington',
    authorEmail: 'dom@harringtonxxxxx',
    authorDate: '2015-04-09 09:39:23 +0100',
    authorDateRel: '6 days ago',
    committerName: 'Dom Harrington',
    committerEmail: 'dom@harringtonxxxxx',
    committerDate: 'Thu Apr 9 09:39:23 2015 +0100',
    committerDateRel: '6 days ago',
    subject: '1.0.0',
    status: [ 'M' ],
    files: [ 'package.json' ] }
```
