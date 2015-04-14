module.exports = gitlog;
var exec = require('child_process').exec,
  extend = require('lodash.assign'),
  delimiter = '\t',
  fields = {
    hash: '%H',
    abbrevHash: '%h',
    treeHash: '%T',
    abbrevTreeHash: '%t',
    parentHashes: '%P',
    abbrevParentHashes: '%P',
    authorName: '%an',
    authorEmail: '%ae',
    authorDate: '%ai',
    authorDateRel: '%ar',
    committerName: '%cn',
    committerEmail: '%ce',
    committerDate: '%cd',
    committerDateRel: '%cr',
    subject: '%s'
  }, notOptFields = [
    'status', 'files'
  ];

/***
    Add optional parameter to command
*/
function addOptional(command, options) {
  var cmdOptional = ['author', 'since', 'after', 'until', 'before', 'commiter'];
  for (var i = cmdOptional.length; i--;) {
    if (options[cmdOptional[i]]) {
      command += ' --' + cmdOptional[i] + '="' + options[cmdOptional[i]] + '"';
    }
  }
  return command;
}

function gitlog(options, cb) {
  if (!options.repo) {
    throw new Error('Repo required!');
  }
  if (!cb) {
    throw new Error('Callback required!');
  }

  var defaultOptions = {
    number: 10,
    fields: ['abbrevHash', 'hash', 'subject', 'authorName']
  };

  // Set defaults
  options = extend(defaultOptions, options);

  // Start constructing command
  var command = 'cd ' + options.repo + ' && git log -n ' + options.number;

  command = addOptional(command, options);

  // Start of custom format
  command += ' --pretty="@begin@';

  // Iterating through the fields and adding them to the custom format
  options.fields.forEach(function(field) {
    if (!fields[field] && field.indexOf(notOptFields) === -1) throw new Error('Unknown field: ' + field);
    command += delimiter + fields[field];
  });

  // Close custom format
  command += '@end@"';

  // Append branch if specified
  if (options.branch) {
    command += ' ' + options.branch;
  }

  if (options.file) {
    command += ' -- ' + options.file;
  }

  //File and fiel status
  command += ' --name-status';

  exec(command, function(err, stdout, stderr) {
    var commits = stdout.split('\n@begin@');

    // Remove the last blank element from the array
    commits.pop();

    commits = parseCommits(commits, options.fields);

    cb(stderr || err, commits);
  });
}

function parseCommits(commits, fields) {
  return commits.map(function(commit) {
    var parts = commit.split('@end@\n\n');
    commit = parts[0].split(delimiter);

    if (parts[1]) {
      commit = commit.concat(parts[1].replace(/\n/g, '\t').split(delimiter));
    }

    // Remove the first empty char from the array
    commit.shift();

    var parsed = {};

    commit.forEach(function(commitField, index) {
      if (fields[index]) {
        parsed[fields[index]] = commitField;
      } else {
        var pos = index % notOptFields.length;

        if (!parsed[notOptFields[pos]]) {
          parsed[notOptFields[pos]] = [];
        }
        parsed[notOptFields[pos]].push(commitField);
      }
    });

    return parsed;
  });
}
