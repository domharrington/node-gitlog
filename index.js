module.exports = gitlog

var exec = require('child_process').exec
  , _ = require('underscore')
  // The character to split commit fields by in the custom format
  , delimiter = '\t'
  , fields = { hash: '%H'
             , abbrevHash: '%h'
             , treeHash: '%T'
             , abbrevTreeHash: '%t'
             , parentHashes: '%P'
             , abbrevParentHashes: '%P'
             , authorName: '%an'
             , authorEmail: '%ae'
             , authorDate: '%ai'
             , authorDateRel: '%ar'
             , committerName: '%cn'
             , committerEmail: '%ce'
             , committerDate: '%cd'
             , committerDateRel: '%cr'
             , subject: '%s'
             }

function gitlog(options, cb) {
  if (!options.repo) throw new Error('Repo required!')
  if (!cb) throw new Error('Callback required!')

  var defaultOptions= { number: 10
                      , fields: [ 'abbrevHash'
                                , 'hash'
                                , 'subject'
                                , 'authorName'
                                ]
                      }

  // Set defaults
  options = _.extend(defaultOptions, options)

  // Start constructing command
  var command = 'cd ' + options.repo + ' && git log -n ' + options.number

  if (options.author) {
    command += ' --author="' + options.author + '"'
  }

  if (options.since) {
    command += ' --since="' + options.since + '"'
  }

  if (options.until) {
    command += ' --until="' + options.until + '"'
  }

  // Start of custom format
  command += ' --pretty="'

  // Iterating through the fields and adding them to the custom format
  options.fields.forEach(function(field) {
    if (!fields[field]) throw new Error('Unknown field: ' + field)
    command += delimiter + fields[field]
  })

  // Close custom format
  command += '"'

  //Append branch if specified
  if (options.branch) {
    command += ' ' + options.branch
  }

  exec(command, function(err, stdout, stderr) {
    var commits = stdout.split('\n')

    // Remove the last blank element from the array
    commits.pop()

    commits = parseCommits(commits, options.fields)

    cb(stderr || err, commits)
  })
}

function parseCommits(commits, fields) {
  return commits.map(function(commit) {
    commit = commit.split(delimiter)

    // Remove the first empty char from the array
    commit.shift()

    var parsed = {}

    commit.forEach(function(commitField, index) {
      parsed[fields[index]] = commitField
    })

    return parsed
  })
}
