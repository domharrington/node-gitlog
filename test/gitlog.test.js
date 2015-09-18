var gitlog = require('../')
  , exec = require('child_process').exec
  , testRepoLocation = __dirname + '/test-repo-clone'

function execInTestDir(command, cb) {
  exec(command, { cwd: __dirname },  cb)
}

describe('gitlog', function() {

  before(function(done) {
    execInTestDir(__dirname + '/delete-repo.sh', function(error) {
      if (error) {
        return done(error)
      }
      execInTestDir(__dirname + '/create-repo.sh', done)
    })
  })

  it('throws an error when repo is not provided', function() {
    (function() {
      gitlog({}, function() {})
    }).should.throw('Repo required!')
  })

  it('throws an error when cb is not provided', function() {
    (function() {
      gitlog({ repo: 'test-repo' })
    }).should.throw('Callback required!')
  })

  it('throws an error when repo location does not exist', function() {
    (function() {
      gitlog({ repo: 'wrong directory' }, function() {})
    }).should.throw('Repo location does not exist')
  })

  it('throws an error when an unknown field is used', function() {
    var field = 'fake-field'
    ; (function() {
      gitlog({ repo: testRepoLocation, fields: [ field ] }, function() {});
    }).should.throw('Unknown field: ' + field)
  })

  it('returns 20 commits from specified branch', function(done) {
    gitlog({ repo: testRepoLocation, branch: 'master', number: 100 }, function(err, commits) {
      commits.length.should.equal(20)
      done()
    })
  })

  it('defaults to 10 commits', function(done) {
    gitlog({ repo: testRepoLocation }, function(err, commits) {
      commits.length.should.equal(10)

      done()
    })
  })

  it('returns the fields requested', function(done) {
    var fields =
      [ 'hash'
      , 'abbrevHash'
      , 'treeHash'
      , 'authorName'
      , 'authorEmail'
      ]

    gitlog({ repo: testRepoLocation, fields: fields, nameStatus: false }, function(err, commits) {
      commits[0].should.be.a('object')
      commits[0].should.have.keys(fields)

      done()
    })
  })

  it('returns a default set of fields', function(done) {
    var defaults = [ 'abbrevHash', 'hash', 'subject', 'authorName' ]

    gitlog({ repo: testRepoLocation, nameStatus: false }, function(err, commits) {
      commits[0].should.have.keys(defaults)

      done()
    })
  })

  it('returns nameStatus fields', function(done) {
    var defaults = [ 'abbrevHash', 'hash', 'subject', 'authorName', 'status', 'files' ]

    gitlog({ repo: testRepoLocation }, function(err, commits) {
      commits[0].should.have.keys(defaults)

      done()
    })
  })

  it('returns fields with "since" limit', function(done) {

    gitlog({ repo: testRepoLocation, since: '1 minutes ago' }, function(err, commits) {
      commits.length.should.equal(10)

      done()
    })
  })

  it('returns fields with "after" limit', function(done) {

    gitlog({ repo: testRepoLocation, after: '1 minutes ago' }, function(err, commits) {
      commits.length.should.equal(10)

      done()
    })
  })

  it('returns fields with "before" limit', function(done) {

    gitlog({ repo: testRepoLocation, before: '2001-12-01' }, function(err, commits) {
      commits.length.should.equal(0)

      done()
    })
  })

  it('returns fields with "until" limit', function(done) {

    gitlog({ repo: testRepoLocation, until: '2001-12-01' }, function(err, commits) {
      commits.length.should.equal(0)

      done()
    })
  })

  it('returns commits only by author', function(done) {
    var defaults = [ 'authorName' ]
    ,  command = 'cd ' + testRepoLocation + ' ' +
                  '&& touch new-file ' +
                  '&& git add new-file ' +
                  '&& git commit -m "New commit" ' +
                  '--author="A U Thor <author@example.com>"'

      , author = 'Dom Harrington'

    // Adding a new commit by different author
    exec(command, function() {
      gitlog({ repo: testRepoLocation, author: author, fields: defaults }, function(err, commits) {

        commits.forEach(function(commit) {
          commit.authorName.should.equal(author)
        })

        done()
      })
    })
  })

  it('returns commits only by committer', function(done) {
    var defaults = [ 'committerName' ]
    , command = 'cd ' + testRepoLocation + ' ' +
                  '&& touch new-file ' +
                  '&& git add new-file ' +
                  '&& git commit -m "New commit" ' +
                  '--committer="A U Thor <author@example.com>"'

      , committer = 'Dom Harrington'

    // Adding a new commit by different author
    exec(command, function() {
      gitlog({ repo: testRepoLocation, committer: committer, fields: defaults }, function(err, commits) {

        commits.forEach(function(commit) {
          commit.committerName.should.equal(committer)
        })

        done()
      })
    })
  })

  after(function(done) {
    execInTestDir(__dirname + '/delete-repo.sh', function() {
      done()
    })
  })

})
