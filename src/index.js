const { exec } = require("child_process");
const { execSync } = require("child_process");
const { existsSync } = require("fs");
const debug = require("debug")("gitlog");
const extend = require("lodash.assign");

const delimiter = "\t";
const fieldMap = {
  hash: "%H",
  abbrevHash: "%h",
  treeHash: "%T",
  abbrevTreeHash: "%t",
  parentHashes: "%P",
  abbrevParentHashes: "%P",
  authorName: "%an",
  authorEmail: "%ae",
  authorDate: "%ai",
  authorDateRel: "%ar",
  committerName: "%cn",
  committerEmail: "%ce",
  committerDate: "%cd",
  committerDateRel: "%cr",
  subject: "%s",
  body: "%b",
  rawBody: "%B"
};
const notOptFields = ["status", "files"];

/** Add optional parameter to command */
function addOptional(command, options) {
  let commandWithOptions = command;
  const cmdOptional = [
    "author",
    "since",
    "after",
    "until",
    "before",
    "committer"
  ];

  for (let i = cmdOptional.length; i--; ) {
    if (options[cmdOptional[i]]) {
      commandWithOptions += ` --${cmdOptional[i]}="${options[cmdOptional[i]]}"`;
    }
  }

  return commandWithOptions;
}

/** Parse the output of "git log" for commit information */
const parseCommits = (commits, fields, nameStatus) => {
  return commits.map(rawCommit => {
    const parts = rawCommit.split("@end@");
    let commit = parts[0].split(delimiter);

    if (parts[1]) {
      let parseNameStatus = parts[1].trimLeft().split("\n");

      // Removes last empty char if exists
      if (parseNameStatus[parseNameStatus.length - 1] === "") {
        parseNameStatus.pop();
      }

      // Split each line into it's own delimited array
      parseNameStatus.forEach((d, i) => {
        parseNameStatus[i] = d.split(delimiter);
      });

      // 0 will always be status, last will be the filename as it is in the commit,
      // anything in between could be the old name if renamed or copied
      parseNameStatus = parseNameStatus.reduce((a, b) => {
        const tempArr = [b[0], b[b.length - 1]];

        // If any files in between loop through them
        for (let i = 1, len = b.length - 1; i < len; i++) {
          // If status R then add the old filename as a deleted file + status
          // Other potentials are C for copied but this wouldn't require the original deleting
          if (b[0].slice(0, 1) === "R") {
            tempArr.push("D", b[i]);
          }
        }

        return a.concat(tempArr);
      }, []);

      commit = commit.concat(parseNameStatus);
    }

    debug("commit", commit);

    // Remove the first empty char from the array
    commit.shift();

    const parsed = {};

    if (nameStatus) {
      // Create arrays for non optional fields if turned on
      notOptFields.forEach(d => {
        parsed[d] = [];
      });
    }

    commit.forEach((commitField, index) => {
      if (fields[index]) {
        parsed[fields[index]] = commitField;
      } else if (nameStatus) {
        const pos = (index - fields.length) % notOptFields.length;

        debug(
          "nameStatus",
          index - fields.length,
          notOptFields.length,
          pos,
          commitField
        );
        parsed[notOptFields[pos]].push(commitField);
      }
    });

    return parsed;
  });
};

/** Run "git log" and return the result as JSON */
function gitlog(userOptions, cb) {
  if (!userOptions.repo) {
    throw new Error("Repo required!");
  }

  if (!existsSync(userOptions.repo)) {
    throw new Error("Repo location does not exist");
  }

  const defaultOptions = {
    number: 10,
    fields: ["abbrevHash", "hash", "subject", "authorName"],
    nameStatus: true,
    includeMergeCommitFiles: false,
    findCopiesHarder: false,
    all: false,
    execOptions: { cwd: userOptions.repo }
  };

  // Set defaults
  const options = { ...defaultOptions, ...userOptions };
  extend(options.execOptions, defaultOptions.execOptions);

  // Start constructing command
  let command = "git log ";

  if (options.findCopiesHarder) {
    command += "--find-copies-harder ";
  }

  if (options.all) {
    command += "--all ";
  }

  if (options.includeMergeCommitFiles) {
    command += "-m ";
  }

  command += `-n ${options.number}`;

  command = addOptional(command, options);

  // Start of custom format
  command += ' --pretty="@begin@';

  // Iterating through the fields and adding them to the custom format
  options.fields.forEach(field => {
    if (!fieldMap[field] && notOptFields.indexOf(field) === -1) {
      throw new Error(`Unknown field: ${field}`);
    }

    command += delimiter + fieldMap[field];
  });

  // Close custom format
  command += '@end@"';

  // Append branch (revision range) if specified
  if (options.branch) {
    command += ` ${options.branch}`;
  }

  // File and file status
  if (options.nameStatus) {
    command += " --name-status";
  }

  if (options.file) {
    command += ` -- ${options.file}`;
  }

  debug("command", options.execOptions, command);

  if (!cb) {
    // run Sync
    const stdout = execSync(command, options.execOptions).toString();
    let commits = stdout.split("@begin@");

    if (commits[0] === "") {
      commits.shift();
    }

    debug("commits", commits);

    commits = parseCommits(commits, options.fields, options.nameStatus);

    return commits;
  }

  exec(command, options.execOptions, function(err, stdout, stderr) {
    debug("stdout", stdout);
    let commits = stdout.split("@begin@");

    if (commits[0] === "") {
      commits.shift();
    }

    debug("commits", commits);

    commits = parseCommits(commits, options.fields, options.nameStatus);

    cb(stderr || err, commits);
  });
}

module.exports = gitlog;
