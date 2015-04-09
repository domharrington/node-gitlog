# node-gitlog

Git log parser for Node.JS

[![build status](https://api.travis-ci.org/domharrington/node-gitlog.svg)](http://travis-ci.org/domharrington/node-gitlog)
[![dependency status](https://david-dm.org/domharrington/node-gitlog.svg)](https://david-dm.org/domharrington/node-gitlog)

## Installation

     npm install gitlog --save

## Usage

```js
var gitlog = require('../')
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

### repo
The location of the repo, required field.

### number
The number of commits to return, defaults to 10.

### author
The author who's commits to return.

### fields
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
- subject - commit message

Defaults to 'abbrevHash', 'hash', 'subject' and 'authorName'.

## How it works

This module works by executing a child process (using `child_process.exec()`) to the `git` executable, then parsing the stdout into commits. This is done using the `--pretty` command line option which allows you to provide a custom formatter to `git log`. To enable easy parsing the format is delimited by a tab (`\t`) character.
