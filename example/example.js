var gitlog = require("../"),
  options = {
    repo: __dirname + "/test-repo-folder",
    number: 20,
    author: "Dom Harrington",
    fields: ["hash", "abbrevHash", "subject", "authorName", "authorDateRel"],
  };

gitlog(options, function (error, commits) {
  // Commits is an array of commits in the repo
  console.log(commits);
});
