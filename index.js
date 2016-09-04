module.exports = gitlog
var exec = require('child_process').exec
  , execSync = require('child_process').execSync
  , debug = require('debug')('gitlog')
  , extend = require('lodash.assign')
  , delimiter = '\t'
  , fields =
    { hash: '%H'
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
    , body: '%B'
    }
  , notOptFields = [ 'status', 'files' ]

/***
    Add optional parameter to command
*/
function addOptional(command, options) {
  var cmdOptional = [ 'author', 'since', 'after', 'until', 'before', 'committer' ]
  for (var i = cmdOptional.length; i--;) {
    if (options[cmdOptional[i]]) {
      command += ' --' + cmdOptional[i] + '="' + options[cmdOptional[i]] + '"'
    }
  }
  return command
}

function gitlog(options, cb) {
  if (!options.repo) throw new Error('Repo required!')

  var defaultOptions =
    { number: 10
    , fields: [ 'abbrevHash', 'hash', 'subject', 'authorName' ]
    , nameStatus:true
    , findCopiesHarder:false
    , all:false
    , execOptions: {}
    }

  // Set defaults
  options = extend(defaultOptions, options)

  var prevWorkingDir =  process.cwd()
  try {
    process.chdir(options.repo)
  } catch (e) {
    throw new Error('Repo location does not exist')
  }

  // Start constructing command
  var command = 'git log '

  if (options.findCopiesHarder){
    command += '--find-copies-harder '
  }

  if (options.all){
    command += '--all '
  }

  command += '-n ' + options.number

  command = addOptional(command, options)

  // Start of custom format
  command += ' --pretty="@begin@'

  // Iterating through the fields and adding them to the custom format
  options.fields.forEach(function(field) {
    if (!fields[field] && field.indexOf(notOptFields) === -1) throw new Error('Unknown field: ' + field)
    command += delimiter + fields[field]
  })

  // Close custom format
  command += '@end@"'

  // Append branch if specified
  if (options.branch) {
    command += ' ' + options.branch
  }

  if (options.file) {
    command += ' -- ' + options.file
  }

  //File and file status
  command += fileNameAndStatus(options)

  debug('command', options.execOptions, command)

  if (!cb) {
    // run Sync

    var stdout = execSync(command, options.execOptions).toString()
      , commits = stdout.split('\n@begin@')

    if (commits.length === 1 && commits[0] === '' ){
      commits.shift()
    }

    debug('commits',commits)

    commits = parseCommits(commits, options.fields,options.nameStatus)

    process.chdir(prevWorkingDir)

    return commits
  }

  exec(command, options.execOptions, function(err, stdout, stderr) {
    debug('stdout',stdout)
    var commits = stdout.split('\n@begin@')
    if (commits.length === 1 && commits[0] === '' ){
      commits.shift()
    }
    debug('commits',commits)

    commits = parseCommits(commits, options.fields, options.nameStatus)

    cb(stderr || err, commits)
  })

  process.chdir(prevWorkingDir);
}

function fileNameAndStatus(options) {
  return options.nameStatus ? ' --name-status' : '';
}

function parseCommits(commits, fields, nameStatus) {
  return commits.map(function(commit) {
    var parts = commit.split('@end@\n\n')

    commit = parts[0].split(delimiter)

    if (parts[1]) {
      var parseNameStatus = parts[1].split('\n');

      // Removes last empty char if exists
      if (parseNameStatus[parseNameStatus.length - 1] === ''){
        parseNameStatus.pop()
      }

      // Split each line into it's own delimitered array
      parseNameStatus.forEach(function(d, i) {
        parseNameStatus[i] = d.split(delimiter);
      });

      // 0 will always be status, last will be the filename as it is in the commit,
      // anything inbetween could be the old name if renamed or copied
      parseNameStatus = parseNameStatus.reduce(function(a, b) {
        var tempArr = [ b[ 0 ], b[ b.length - 1 ] ];

        // If any files in between loop through them
        for (var i = 1, len = b.length - 1; i < len; i++) {
          // If status R then add the old filename as a deleted file + status
          // Other potentials are C for copied but this wouldn't require the original deleting
          if (b[ 0 ].slice(0, 1) === 'R'){
            tempArr.push('D', b[ i ]);
          }
        }

        return a.concat(tempArr);
      }, [])

      commit = commit.concat(parseNameStatus)
    }

    debug('commit', commit)

    // Remove the first empty char from the array
    commit.shift()

    var parsed = {}

    if (nameStatus){
      // Create arrays for non optional fields if turned on
      notOptFields.forEach(function(d) {
        parsed[d] = [];
      })
    }

    commit.forEach(function(commitField, index) {
      if (fields[index]) {
        parsed[fields[index]] = commitField
      } else {
        if (nameStatus){
          var pos = (index - fields.length) % notOptFields.length

          debug('nameStatus', (index - fields.length) ,notOptFields.length,pos,commitField)
          parsed[notOptFields[pos]].push(commitField)
        }
      }
    })

    return parsed
  })
}
