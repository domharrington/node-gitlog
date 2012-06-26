var should = require('should')
  , gitlog = require('../')
  , exec = require('child_process').exec
  , testRepoLocation = __dirname + '/test-repo-clone'

function execInTestDir(command, cb) {
  exec(command, { cwd: __dirname },  cb)
}

describe('gitlog', function() {

  before(function(done) {
    execInTestDir(__dirname + '/delete-repo.sh', function(error, out, err) {
      execInTestDir(__dirname + '/create-repo.sh', function(error, out, err) {
        done()
      })
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

  it('throws an error when an unknown field is used', function() {
    var field = 'fake-field'
    ; (function() {
      gitlog({ repo: 'test-repo', fields: [field] }, function() {});
    }).should.throw('Unknown field: ' + field)
  })

  it('defaults to 10 commits', function(done) {
    gitlog({ repo: testRepoLocation }, function(err, commits) {
      commits.length.should.equal(10)

      done()
    })
  })

  it('returns the fields requested', function(done) {
    var fields = [ 'hash'
                 , 'abbrevHash'
                 , 'treeHash'
                 , 'authorName'
                 , 'authorEmail'
                 ]

    gitlog({ repo: testRepoLocation, fields: fields }, function(err, commits) {
      commits[0].should.be.a('object')
      commits[0].should.have.keys(fields)

      done()
    })
  })

  it('returns a default set of fields', function(done) {
    var defaults = ['abbrevHash', 'hash', 'subject', 'authorName']

    gitlog({ repo: testRepoLocation }, function(err, commits) {
      commits[0].should.have.keys(defaults)

      done()
    })
  })

  it('returns commits only by author', function(done) {
    var command = 'cd ' + testRepoLocation + ' ' +
                  '&& touch new-file ' +
                  '&& git add new-file ' +
                  '&& git commit -m "New commit" ' +
                  '--author="A U Thor <author@example.com>"'

    var author = 'Dom Harrington'

    // Adding a new commit by different author
    exec(command, function() {
      gitlog({ repo: testRepoLocation, author: author },
        function(err, commits) {

        commits.forEach(function(commit) {
          commit.authorName.should.equal(author)
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