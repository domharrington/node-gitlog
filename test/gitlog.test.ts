import fs from "fs";
import { execSync } from "child_process";
import gitlog from "../src";

const testRepoLocation = `${__dirname}/test-repo-clone`;

function execInTmpDir(command: string) {
  try {
    execSync(command, { cwd: __dirname, stdio: "inherit" });
  } catch (e) {
    console.error("Error with execSync", e);
  }
}

describe("gitlog", () => {
  beforeEach(() => {
    execInTmpDir(`${__dirname}/delete-repo.sh`);
    execInTmpDir(`${__dirname}/create-repo.sh`);
  });

  afterAll(() => {
    execInTmpDir(`${__dirname}/delete-repo.sh`);
  });

  it("throws an error when repo is not provided", async () => {
    // @ts-ignore
    await expect(() => gitlog({})).rejects.toThrow("Repo required!");
  });

  it("throws an error when repo location does not exist", async () => {
    await expect(() => gitlog({ repo: "wrong directory" })).rejects.toThrow(
      "Repo location does not exist"
    );
  });

  it("throws an error when an unknown field is used", async () => {
    const field = "fake-field";

    await expect(() =>
      // @ts-ignore
      gitlog({ repo: testRepoLocation, fields: [field] })
    ).rejects.toThrow(`Unknown field: ${field}`);
  });

  it("throws an error when bad option", async () => {
    await expect(
      gitlog({ repo: testRepoLocation, branch: "not-a-branch" })
    ).rejects.toThrow(
      "fatal: ambiguous argument 'not-a-branch': unknown revision or path not in the working tree"
    );
  });

  it("returns 21 commits from specified branch", async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      branch: "new-branch",
      number: 100,
    });
    expect(commits.length).toBe(21);
  });

  it("returns 1 commit from specified revision range", async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      branch: "main..new-branch",
      number: 100,
    });
    expect(commits.length).toBe(1);
    expect(commits[0].subject).toBe("Added new file on new branch");
  });

  it("returns 25 commits from repository with all=false", async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      all: false,
      number: 100,
    });
    expect(commits.length).toBe(25);
  });

  it("returns 26 commits from repository with all=true", async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      all: true,
      number: 100,
    });
    expect(commits.length).toBe(26);
  });

  it("defaults to 10 commits", async () => {
    const commits = await gitlog({ repo: testRepoLocation });
    expect(commits.length).toBe(10);
  });

  it("returns 10 commits from other dir, execOptions specified", async () => {
    const cwd = process.cwd();
    process.chdir("/tmp");
    const commits = await gitlog({
      repo: testRepoLocation,
      execOptions: { encoding: "utf8" },
    });
    expect(commits.length).toBe(10);
    process.chdir(cwd);
  });

  it("returns 10 commits from other dir", async () => {
    const cwd = process.cwd();
    process.chdir("/tmp");
    const commits = await gitlog({ repo: testRepoLocation });
    expect(commits.length).toBe(10);
    process.chdir(cwd);
  });

  it("returns the fields requested", async () => {
    const fields = [
      "hash",
      "abbrevHash",
      "treeHash",
      "authorName",
      "authorEmail",
    ] as const;

    const commits = await gitlog({
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

  it("returns a default set of fields", async () => {
    const commits = await gitlog({ repo: testRepoLocation, nameStatus: false });

    expect(commits[0].abbrevHash).toBeDefined();
    expect(commits[0].subject).toBeDefined();
    expect(commits[0].authorName).toBeDefined();
    expect(commits[0].hash).toBeDefined();
    // @ts-ignore
    expect(commits[0].status).not.toBeDefined();
    // @ts-ignore
    expect(commits[0].files).not.toBeDefined();
  });

  it('returns fields with "since" limit', async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      since: "1 minutes ago",
    });
    expect(commits).toHaveLength(10);
  });

  it('returns fields with "after" limit', async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      after: "1 minutes ago",
    });
    expect(commits).toHaveLength(10);
  });

  it('returns fields with "before" limit', async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      before: "2001-12-01",
    });
    expect(commits).toHaveLength(0);
  });

  it('returns fields with "until" limit', async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      until: "2001-12-01",
    });
    expect(commits).toHaveLength(0);
  });

  it("returns commits only by author", async () => {
    const defaults = ["authorName"] as const;
    const command =
      `cd ${testRepoLocation}` +
      `&& touch new-file-author ` +
      `&& git add new-file-author ` +
      `&& git commit -m "New commit"`;
    const author = "Your Name";

    // Adding a new commit by different author
    execSync(command, {
      env: {
        GIT_AUTHOR_NAME: "A U Thor",
        GIT_AUTHOR_EMAIL: "author@example.com",
      },
    });

    const commits = await gitlog({
      repo: testRepoLocation,
      author,
      fields: defaults,
    });
    expect.assertions(10);
    commits.forEach((commit) => {
      expect(commit.authorName).toBe(author);
    });
  });

  it("returns commits only by committer", async () => {
    const defaults = ["committerName"] as const;
    const command =
      `cd ${testRepoLocation} ` +
      `&& touch new-file-1 ` +
      `&& git add new-file-1 ` +
      `&& git commit -am "New commit"`;
    const committer = "Your Name";

    execSync(command, {
      env: {
        GIT_COMMITTER_NAME: "A U Thor",
        GIT_COMMITTER_EMAIL: "author@example.com",
      },
    });

    const commits = await gitlog({
      repo: testRepoLocation,
      committer,
      fields: defaults,
    });
    expect.assertions(10);
    commits.forEach((commit) => {
      expect(commit.committerName).toBe(committer);
    });
  });

  it("returns C100 status for files that are copied", async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      findCopiesHarder: true,
    });
    expect(commits[4].status[0]).toBe("C100");
  });

  it("returns merge commits files when includeMergeCommitFiles is true", async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      includeMergeCommitFiles: true,
    });
    expect(commits[3].files[0]).toBe("foo");
  });

  describe("Only repo option", () => {
    let commits: any[];
    beforeAll(async () => {
      commits = await gitlog({ repo: testRepoLocation });
    });

    it("returns nameStatus fields", () => {
      expect(commits[0].abbrevHash).toBeDefined();
      expect(commits[0].subject).toBeDefined();
      expect(commits[0].authorName).toBeDefined();
      expect(commits[0].hash).toBeDefined();
      expect(commits[0].status).toBeDefined();
      expect(commits[0].files).toBeDefined();
    });

    it("returns A status for files that are added", () => {
      expect(commits[4].status[0]).toBe("A");
    });

    it("returns M status for files that are modified", () => {
      expect(commits[6].status[0]).toBe("M");
    });

    it("returns D status for files that are deleted", () => {
      expect(commits[7].status[0]).toBe("D");
    });

    it("returns author name correctly", () => {
      expect.assertions(10);
      commits.forEach((commit) => {
        expect(commit.authorName).toBe("Your Name");
      });
    });
  });

  // This fails inconsistently on different versions of git
  // https://github.com/domharrington/node-gitlog/issues/24
  //
  // it('returns R100 & D status for files that are renamed (100 is % of similarity) or A', function() {
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

  it("should allow both body and rawBody", async () => {
    const commits = await gitlog({
      repo: testRepoLocation,
      fields: ["body", "rawBody"],
    });

    expect(commits[0].body).toBeDefined();
    expect(commits[0].rawBody).toBeDefined();
  });

  it("should be able to get commit counts for a specific line only", async () => {
    const commitsForFirstLine = await gitlog({
      repo: testRepoLocation,
      fileLineRange: {
        file: "fileToModify",
        startLine: 1,
        endLine: 1,
      },
    });
    expect(commitsForFirstLine.length).toBe(1);
    const commitsForLastLine = await gitlog({
      repo: testRepoLocation,
      fileLineRange: {
        file: "fileToModify",
        startLine: 20,
        endLine: 20,
      },
    });
    expect(commitsForLastLine.length).toBe(3);
  });

  it("should not execute shell commands", async () => {
    await expect(
      gitlog({
        repo: testRepoLocation,
        branch: "$(touch ../exploit)",
      })
    ).rejects.toThrow(
      "fatal: ambiguous argument '$(touch ../exploit)': unknown revision or path not in the working tree."
    );

    const exists = fs.existsSync("./test/exploit");
    expect(exists).toBe(false);
    if (exists) {
      fs.unlinkSync("./test/exploit");
    }
  });

  it("should support tabs in commit messages", async () => {
    const command =
      `cd ${testRepoLocation}` +
      `&& git commit --allow-empty -m "this\t\message\tcontains\ttabs"`;

    // Adding a new commit by different author
    execSync(command);
    const [commit] = await gitlog({
      repo: testRepoLocation,
      number: 1,
    });

    expect(commit.subject).toBe("this\tmessage\tcontains\ttabs");
  });
});
