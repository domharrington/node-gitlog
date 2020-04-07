/* eslint-disable handle-callback-err, no-unused-expressions */

import { exec, execSync } from "child_process";
import gitlog from "../src";

const testRepoLocation = `${__dirname}/test-repo-clone`;

function execInTestDir(command: string) {
  execSync(command, { cwd: __dirname, stdio: "ignore" });
}

describe("gitlog", () => {
  beforeEach(() => {
    execInTestDir(`${__dirname}/delete-repo.sh`);
    execInTestDir(`${__dirname}/create-repo.sh`);
  });

  it("throws an error when repo is not provided", () => {
    // @ts-ignore
    expect(() => gitlog({})).toThrow("Repo required!");
  });

  it("throws an error when repo location does not exist", () => {
    expect(() => gitlog({ repo: "wrong directory" })).toThrow(
      "Repo location does not exist"
    );
  });

  it("throws an error when an unknown field is used", () => {
    const field = "fake-field";

    // @ts-ignore
    expect(() => gitlog({ repo: testRepoLocation, fields: [field] })).toThrow(
      `Unknown field: ${field}`
    );
  });

  it("returns 21 commits from specified branch", (done) => {
    gitlog(
      { repo: testRepoLocation, branch: "new-branch", number: 100 },
      (err, commits) => {
        expect(err).toBeNull();
        expect(commits.length).toBe(21);
        done();
      }
    );
  });

  it("returns 1 commit from specified revision range", (done) => {
    gitlog(
      { repo: testRepoLocation, branch: "master..new-branch", number: 100 },
      (err, commits) => {
        expect(err).toBeNull();
        expect(commits.length).toBe(1);
        expect(commits[0].subject).toBe("Added new file on new branch");
        done();
      }
    );
  });

  it("returns 22 commits from repository with all=false", (done) => {
    gitlog(
      { repo: testRepoLocation, all: false, number: 100 },
      (err, commits) => {
        expect(err).toBeNull();
        expect(commits.length).toBe(22);
        done();
      }
    );
  });

  it("returns 23 commits from repository with all=true", (done) => {
    gitlog(
      { repo: testRepoLocation, all: true, number: 100 },
      (err, commits) => {
        expect(err).toBeNull();
        expect(commits.length).toBe(23);
        done();
      }
    );
  });

  it("defaults to 10 commits - callback", (done) => {
    gitlog({ repo: testRepoLocation }, (err, commits) => {
      expect(err).toBeNull();
      expect(commits.length).toBe(10);
      done();
    });
  });

  it("returns 10 commits from other dir, execOptions specified", (done) => {
    const cwd = process.cwd();
    process.chdir("/tmp");
    gitlog(
      { repo: testRepoLocation, execOptions: { encoding: "utf8" } },
      (err, commits) => {
        expect(err).toBeNull();
        expect(commits.length).toBe(10);
        done();
      }
    );
    process.chdir(cwd);
  });

  it("returns 10 commits from other dir", (done) => {
    const cwd = process.cwd();
    process.chdir("/tmp");
    gitlog({ repo: testRepoLocation }, (err, commits) => {
      expect(err).toBeNull();
      expect(commits.length).toBe(10);
      done();
    });
    process.chdir(cwd);
  });

  it("returns the fields requested", () => {
    const fields = [
      "hash",
      "abbrevHash",
      "treeHash",
      "authorName",
      "authorEmail",
    ] as const;

    const commits = gitlog({
      repo: testRepoLocation,
      fields,
      nameStatus: false,
    });

    expect(commits[0].abbrevHash).toBeDefined();
    expect(commits[0].authorEmail).toBeDefined();
    expect(commits[0].authorName).toBeDefined();
    expect(commits[0].hash).toBeDefined();
    expect(commits[0].treeHash).toBeDefined();
  });

  it("returns a default set of fields", () => {
    const commits = gitlog({ repo: testRepoLocation, nameStatus: false });

    expect(commits[0].abbrevHash).toBeDefined();
    expect(commits[0].subject).toBeDefined();
    expect(commits[0].authorName).toBeDefined();
    expect(commits[0].hash).toBeDefined();
    // @ts-ignore
    expect(commits[0].status).not.toBeDefined();
    // @ts-ignore
    expect(commits[0].files).not.toBeDefined();
  });

  it("returns nameStatus fields", () => {
    const commits = gitlog({ repo: testRepoLocation });

    expect(commits[0].abbrevHash).toBeDefined();
    expect(commits[0].subject).toBeDefined();
    expect(commits[0].authorName).toBeDefined();
    expect(commits[0].hash).toBeDefined();
    expect(commits[0].status).toBeDefined();
    expect(commits[0].files).toBeDefined();
  });

  it('returns fields with "since" limit', () => {
    const commits = gitlog({ repo: testRepoLocation, since: "1 minutes ago" });
    expect(commits).toHaveLength(10);
  });

  it('returns fields with "after" limit', () => {
    const commits = gitlog({ repo: testRepoLocation, after: "1 minutes ago" });
    expect(commits).toHaveLength(10);
  });

  it('returns fields with "before" limit', () => {
    const commits = gitlog({ repo: testRepoLocation, before: "2001-12-01" });
    expect(commits).toHaveLength(0);
  });

  it('returns fields with "until" limit', () => {
    const commits = gitlog({ repo: testRepoLocation, until: "2001-12-01" });
    expect(commits).toHaveLength(0);
  });

  it("returns commits only by author", (done) => {
    const defaults = ["authorName"] as const;
    const command =
      `cd ${testRepoLocation}` +
      `&& touch new-file` +
      `&& git add new-file` +
      `&& git commit -m "New commit" --author="A U Thor <author@example.com>"`;
    const author = "Your Name";

    // Adding a new commit by different author
    exec(command, () => {
      const commits = gitlog({
        repo: testRepoLocation,
        author,
        fields: defaults,
      });

      expect.assertions(10);
      commits.forEach((commit) => {
        expect(commit.authorName).toBe(author);
      });

      done();
    });
  });

  it("returns commits only by committer", (done) => {
    const defaults = ["committerName"] as const;
    const command =
      `cd ${testRepoLocation} ` +
      `&& touch new-file ` +
      `&& git add new-file ` +
      `&& git commit -m "New commit" ` +
      `--committer="A U Thor <author@example.com>"`;
    const committer = "Your Name";

    // Adding a new commit by different author
    exec(command, () => {
      const commits = gitlog({
        repo: testRepoLocation,
        committer,
        fields: defaults,
      });

      expect.assertions(10);
      commits.forEach((commit) => {
        expect(commit.committerName).toBe(committer);
      });

      done();
    });
  });

  it("returns A status for files that are added", () => {
    const commits = gitlog({ repo: testRepoLocation });
    expect(commits[1].status[0]).toBe("A");
  });

  it("returns C100 status for files that are copied", () => {
    const commits = gitlog({ repo: testRepoLocation, findCopiesHarder: true });
    expect(commits[1].status[0]).toBe("C100");
  });

  it("returns merge commits files when includeMergeCommitFiles is true", () => {
    const commits = gitlog({
      repo: testRepoLocation,
      includeMergeCommitFiles: true,
    });
    expect(commits[0].files[0]).toBe("foo");
  });

  it("returns M status for files that are modified", () => {
    const commits = gitlog({ repo: testRepoLocation });
    expect(commits[3].status[0]).toBe("M");
  });

  it("returns D status for files that are deleted", () => {
    const commits = gitlog({ repo: testRepoLocation });
    expect(commits[4].status[0]).toBe("D");
  });

  it("returns author name correctly", () => {
    const commits = gitlog({ repo: testRepoLocation });

    expect.assertions(10);
    commits.forEach((commit) => {
      expect(commit.authorName).toBe("Your Name");
    });
  });

  // This fails inconsistently on different versions of git
  // https://github.com/domharrington/node-gitlog/issues/24
  //
  // it('returns R100 & D status for files that are renamed (100 is % of similarity) or A', function(done) {
  //   gitlog({ repo: testRepoLocation, number: 100 }, function(err, commits) {
  //     if (semver.gte(gitVer, '2.0.0')){
  //       commits[5].status[0].should.equal('R100')
  //       commits[5].status[1].should.equal('D')
  //     } else {
  //       commits[5].status[0].should.equal('A')
  //     }
  //     done()
  //   })
  // })

  it("should allow both body and rawBody", () => {
    const commits = gitlog({
      repo: testRepoLocation,
      fields: ["body", "rawBody"],
    });

    expect(commits[0].body).toBeDefined();
    expect(commits[0].rawBody).toBeDefined();
  });

  afterAll(() => {
    execInTestDir(`${__dirname}/delete-repo.sh`);
  });
});
