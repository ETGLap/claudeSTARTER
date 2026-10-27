"use strict";
const test = require("node:test");
const assert = require("node:assert");
const { decideBash } = require("./lib/guards");
const ON = {};

test("decideBash: force-push asks first", () => {
  for (const command of ["git push --force", "git push -f origin main"]) {
    const hit = decideBash({ command, branch: "feature", config: ON });
    assert.ok(hit, command);
    assert.strictEqual(hit.permissionDecision, "ask");
    assert.match(hit.permissionDecisionReason, /force/i);
  }
});

test("decideBash: a plain push is fine", () => {
  assert.strictEqual(
    decideBash({ command: "git push origin feature", branch: "feature", config: ON }),
    null
  );
});

test("decideBash: committing on the default branch asks first", () => {
  for (const branch of ["main", "master"]) {
    const hit = decideBash({ command: 'git commit -m "x"', branch, config: ON });
    assert.ok(hit, branch);
    assert.strictEqual(hit.permissionDecision, "ask");
  }
});

test("decideBash: committing on a feature branch is fine", () => {
  assert.strictEqual(
    decideBash({ command: 'git commit -m "x"', branch: "feat/thing", config: ON }),
    null
  );
});

test("decideBash: recursive force delete asks first", () => {
  for (const command of ["rm -rf build", "rm -fr ./dist", "rm --recursive --force x"]) {
    const hit = decideBash({ command, branch: "feature", config: ON });
    assert.ok(hit, command);
    assert.strictEqual(hit.permissionDecision, "ask");
  }
});

test("decideBash: non-recursive or non-forced rm passes", () => {
  for (const command of ["rm file.txt", "rm -r tmpdir", "rm -f stale.log"]) {
    assert.strictEqual(decideBash({ command, branch: "feature", config: ON }), null);
  }
});

test("decideBash: guarded verbs are only matched as commands, not as substrings", () => {
  for (const command of [
    "echo 'do not rm -rf anything'",
    "grep -r 'git push --force' docs/",
  ]) {
    assert.strictEqual(decideBash({ command, branch: "main", config: ON }), null, command);
  }
});

test("decideBash: chained commands are inspected segment by segment", () => {
  const hit = decideBash({
    command: "npm run build && rm -rf node_modules",
    branch: "feature",
    config: ON,
  });
  assert.ok(hit);
  assert.strictEqual(hit.permissionDecision, "ask");
});

test("decideBash: --force-with-lease still requires history-rewrite approval", () => {
  assert.equal(decideBash({ command: "git push --force-with-lease origin feat" }).permissionDecision, "ask");
});

test("absolute commands and forced refspecs ask without matching quoted prose", () => {
  for (const command of ["/bin/rm -rf build", "'/bin/rm' -rf build", "/usr/bin/git push origin +HEAD:main", "git push --force-with-lease --force origin main"]) {
    assert.equal(decideBash({ command }).permissionDecision, "ask", command);
  }
  for (const command of ["echo 'safe; rm -rf demo'", "git log --grep='push --force'", "git commit -m 'push --force'", "git show 'commit'"]) {
    assert.equal(decideBash({ command, branch: "feature" }), null, command);
  }
});

test("commit checks ask when an earlier command changes the target repository or branch", () => {
  for (const command of ["cd other && git commit -m x", "git -C other commit -m x", "git switch main && git commit -m x"]) {
    assert.equal(decideBash({ command, branch: "feature" }).permissionDecision, "ask", command);
  }
});

test("Git environment overrides make a commit's branch uncertain", () => {
  assert.equal(decideBash({ command: "GIT_DIR=/other/.git GIT_WORK_TREE=/other git commit -m x", branch: "feature" }).permissionDecision, "ask");
});

test("decideBash: a bare --force push still asks", () => {
  const d = decideBash({ command: "git push --force origin feat" });
  assert.strictEqual(d.permissionDecision, "ask");
});

test("decideBash: each git-safety rule is disableable on its own", () => {
  const rm = "rm -rf build";
  const push = "git push --force origin feat";
  assert.strictEqual(decideBash({ command: rm, config: { recursiveDelete: false } }), null);
  assert.ok(decideBash({ command: push, config: { recursiveDelete: false } }));
  assert.strictEqual(decideBash({ command: push, config: { forcePush: false } }), null);
  assert.ok(decideBash({ command: rm, config: { forcePush: false } }));
  assert.strictEqual(
    decideBash({ command: "git commit -m x", branch: "main", config: { defaultBranchCommit: false } }),
    null
  );
});
