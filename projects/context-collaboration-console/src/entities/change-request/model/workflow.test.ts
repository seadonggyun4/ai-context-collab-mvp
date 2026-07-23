import {
  APC_FIXTURE_ACTORS,
  addProposalRevision,
  createApcDomainFixture,
  createApcEvidence,
  recordEvidence,
  recordReview,
  selectCurrentProposal,
  selectVerificationGate,
  transitionChange,
  type ChangeRequestAggregate,
} from "@entities/change-request";
import { getProposalScopeFingerprint } from "@entities/proposal";

import type { DomainResult } from "@shared/lib/result";

function success<T>(result: DomainResult<T>): T {
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.detail}`);
  return result.value;
}

function failureCode<T>(result: DomainResult<T>): string {
  if (result.ok) throw new Error("Expected domain failure");
  return result.error.code;
}

function toReview(aggregate = createApcDomainFixture().aggregate): ChangeRequestAggregate {
  return success(transitionChange(aggregate, {
    target: "IN_REVIEW",
    actor: APC_FIXTURE_ACTORS.requester,
    requestId: "cmd-in-review",
    occurredAt: "2026-07-22T09:10:00+09:00",
  }));
}

function approve(aggregate = toReview()): ChangeRequestAggregate {
  const proposal = selectCurrentProposal(aggregate);
  if (proposal === null) throw new Error("Fixture proposal missing");
  const reviewed = success(recordReview(aggregate, {
    id: "review-approved-1",
    decision: "APPROVED",
    proposalRevision: proposal.revision,
    scopeFingerprint: getProposalScopeFingerprint(proposal),
    comment: "승인 범위와 P0 기준을 확인했습니다.",
    actor: APC_FIXTURE_ACTORS.reviewer,
    requestId: "cmd-review-approved",
    occurredAt: "2026-07-22T09:20:00+09:00",
  }));
  return success(transitionChange(reviewed, {
    target: "APPROVED",
    actor: APC_FIXTURE_ACTORS.reviewer,
    requestId: "cmd-approved",
    occurredAt: "2026-07-22T09:21:00+09:00",
  }));
}

function toImplementing(): ChangeRequestAggregate {
  return success(transitionChange(approve(), {
    target: "IMPLEMENTING",
    actor: APC_FIXTURE_ACTORS.requester,
    requestId: "cmd-implementing",
    occurredAt: "2026-07-22T09:30:00+09:00",
  }));
}

function withEvidence(
  automatedResult: "PASSED" | "FAILED" | "NOT_EXECUTED" | "PARTIALLY_VERIFIED" = "PASSED",
  manualResult: "PASSED" | "MANUAL_REQUIRED" | "NOT_EXECUTED" = "PASSED",
): ChangeRequestAggregate {
  let aggregate = toImplementing();
  aggregate = success(recordEvidence(aggregate, {
    evidence: createApcEvidence(
      aggregate,
      "QA-DEMO-AUTO-01",
      automatedResult,
      "ci-runner",
      "2026-07-22T09:40:00+09:00",
    ),
    actor: APC_FIXTURE_ACTORS.requester,
    requestId: "cmd-evidence-auto",
    occurredAt: "2026-07-22T09:40:00+09:00",
  }));
  aggregate = success(recordEvidence(aggregate, {
    evidence: createApcEvidence(
      aggregate,
      "QA-DEMO-MANUAL-01",
      manualResult,
      manualResult === "PASSED" ? APC_FIXTURE_ACTORS.reviewer.id : APC_FIXTURE_ACTORS.requester.id,
      "2026-07-22T09:41:00+09:00",
    ),
    actor: manualResult === "PASSED" ? APC_FIXTURE_ACTORS.reviewer : APC_FIXTURE_ACTORS.requester,
    requestId: "cmd-evidence-manual",
    occurredAt: "2026-07-22T09:41:00+09:00",
  }));
  return aggregate;
}

function toVerifying(
  automatedResult: "PASSED" | "FAILED" | "NOT_EXECUTED" | "PARTIALLY_VERIFIED" = "PASSED",
  manualResult: "PASSED" | "MANUAL_REQUIRED" | "NOT_EXECUTED" = "PASSED",
): ChangeRequestAggregate {
  return success(transitionChange(withEvidence(automatedResult, manualResult), {
    target: "VERIFYING",
    actor: APC_FIXTURE_ACTORS.reviewer,
    requestId: "cmd-verifying",
    occurredAt: "2026-07-22T09:50:00+09:00",
  }));
}

function toReady(): ChangeRequestAggregate {
  return success(transitionChange(toVerifying(), {
    target: "READY_TO_ACTIVATE",
    actor: APC_FIXTURE_ACTORS.reviewer,
    requestId: "cmd-ready",
    occurredAt: "2026-07-22T10:00:00+09:00",
  }));
}

describe("change request workflow", () => {
  it("completes the P0 review, verification, and activation flow", () => {
    const ready = toReady();
    expect(ready.request.status).toBe("READY_TO_ACTIVATE");
    expect(ready.implementation).toMatchObject({
      revision: 1,
      approvedProposalRevision: 1,
    });
    expect(ready.implementation.approvedScopeFingerprint).toContain("revision=1");

    const activated = success(transitionChange(ready, {
      target: "ACTIVATED",
      activation: { version: "context-v1.4", documentIds: ["DOC-APC-CONTEXT", "DOC-APC-QA"] },
      actor: APC_FIXTURE_ACTORS.admin,
      requestId: "cmd-activate",
      occurredAt: "2026-07-22T10:10:00+09:00",
    }));

    expect(activated.request.status).toBe("ACTIVATED");
    expect(activated.contextVersions).toContainEqual(expect.objectContaining({
      version: "context-v1.4",
      activatedBy: APC_FIXTURE_ACTORS.admin.id,
    }));
    expect(activated.auditEvents).toContainEqual(expect.objectContaining({
      action: "context.activated",
      actorId: APC_FIXTURE_ACTORS.admin.id,
    }));
    expect(failureCode(transitionChange(activated, {
      target: "VERIFYING",
      actor: APC_FIXTURE_ACTORS.admin,
      requestId: "cmd-after-terminal",
      occurredAt: "2026-07-22T10:11:00+09:00",
    }))).toBe("CHANGE_TERMINAL");
  });

  it("rejects state skipping and approval without a recorded decision", () => {
    const analyzed = createApcDomainFixture().aggregate;
    expect(failureCode(transitionChange(analyzed, {
      target: "APPROVED",
      actor: APC_FIXTURE_ACTORS.reviewer,
      requestId: "cmd-skip",
      occurredAt: "2026-07-22T09:05:00+09:00",
    }))).toBe("TRANSITION_FORBIDDEN");

    expect(failureCode(transitionChange(toReview(analyzed), {
      target: "APPROVED",
      actor: APC_FIXTURE_ACTORS.reviewer,
      requestId: "cmd-no-review",
      occurredAt: "2026-07-22T09:11:00+09:00",
    }))).toBe("REVIEW_DECISION_REQUIRED");
  });

  it("requires a non-empty comment for every review decision", () => {
    const inReview = toReview();
    const proposal = selectCurrentProposal(inReview);
    if (proposal === null) throw new Error("Fixture proposal missing");
    expect(failureCode(recordReview(inReview, {
      id: "review-empty-comment",
      decision: "APPROVED",
      proposalRevision: proposal.revision,
      scopeFingerprint: getProposalScopeFingerprint(proposal),
      comment: "   ",
      actor: APC_FIXTURE_ACTORS.reviewer,
      requestId: "cmd-empty-comment",
      occurredAt: "2026-07-22T09:12:00+09:00",
    }))).toBe("REVIEW_COMMENT_REQUIRED");
  });

  it.each([
    ["ACCEPTANCE_CRITERIA_REQUIRED", { acceptanceCriteria: [] }],
    ["CONTEXT_SNAPSHOT_UNLOCKED", { contextSnapshotLocked: false }],
    ["IMPACTS_NOT_REVIEWABLE", {
      impacts: createApcDomainFixture().aggregate.proposals[0]!.impacts.map((impact, index) => (
        index === 0 ? { ...impact, reviewable: false } : impact
      )),
    }],
  ] as const)("enforces the IN_REVIEW guard: %s", (expectedCode, proposalPatch) => {
    const aggregate = createApcDomainFixture().aggregate;
    const current = aggregate.proposals[0];
    if (current === undefined) throw new Error("Fixture proposal missing");
    const invalid = { ...aggregate, proposals: [{ ...current, ...proposalPatch }] };
    expect(failureCode(transitionChange(invalid, {
      target: "IN_REVIEW",
      actor: APC_FIXTURE_ACTORS.requester,
      requestId: `cmd-${expectedCode}`,
      occurredAt: "2026-07-22T09:10:00+09:00",
    }))).toBe(expectedCode);
  });

  it("rejects self approval, insufficient roles, high-risk reviewer approval, and stale scope", () => {
    const inReview = toReview();
    const proposal = selectCurrentProposal(inReview);
    if (proposal === null) throw new Error("Fixture proposal missing");
    const baseCommand = {
      id: "review-negative",
      decision: "APPROVED" as const,
      proposalRevision: proposal.revision,
      scopeFingerprint: getProposalScopeFingerprint(proposal),
      comment: "negative case",
      requestId: "cmd-review-negative",
      occurredAt: "2026-07-22T09:20:00+09:00",
    };

    expect(failureCode(recordReview(inReview, { ...baseCommand, actor: APC_FIXTURE_ACTORS.requester })))
      .toBe("SELF_APPROVAL_FORBIDDEN");
    expect(failureCode(recordReview(inReview, { ...baseCommand, actor: APC_FIXTURE_ACTORS.viewer })))
      .toBe("REVIEW_PERMISSION_DENIED");
    expect(failureCode(recordReview(
      { ...inReview, request: { ...inReview.request, risk: "HIGH" } },
      { ...baseCommand, actor: APC_FIXTURE_ACTORS.reviewer },
    ))).toBe("REVIEW_PERMISSION_DENIED");
    expect(failureCode(recordReview(inReview, {
      ...baseCommand,
      scopeFingerprint: `${baseCommand.scopeFingerprint}:stale`,
      actor: APC_FIXTURE_ACTORS.reviewer,
    }))).toBe("REVIEW_SCOPE_STALE");
    expect(failureCode(recordReview({
      ...inReview,
      proposals: [{ ...proposal, summary: `${proposal.summary} 승인 범위 변경` }],
    }, { ...baseCommand, actor: APC_FIXTURE_ACTORS.reviewer }))).toBe("REVIEW_SCOPE_STALE");
  });

  it("limits the demo self-approval exception and reject action to documented permissions", () => {
    const fixtureReview = toReview();
    const proposal = selectCurrentProposal(fixtureReview);
    if (proposal === null) throw new Error("Fixture proposal missing");
    const normalChange = {
      ...fixtureReview,
      request: {
        ...fixtureReview.request,
        id: "CR-REAL-001",
        requester: { ...fixtureReview.request.requester, role: "reviewer" as const },
      },
    };
    expect(failureCode(recordReview(normalChange, {
      id: "review-forged-demo-exception",
      decision: "APPROVED",
      proposalRevision: proposal.revision,
      scopeFingerprint: getProposalScopeFingerprint(proposal),
      comment: "일반 요청에서 예외 위조",
      actor: normalChange.request.requester,
      requestId: "cmd-forged-demo-exception",
      occurredAt: "2026-07-22T09:22:00+09:00",
      allowFixtureSelfApproval: true,
    }))).toBe("SELF_APPROVAL_FORBIDDEN");

    expect(failureCode(transitionChange(createApcDomainFixture().aggregate, {
      target: "REJECTED",
      actor: APC_FIXTURE_ACTORS.viewer,
      requestId: "cmd-viewer-reject",
      occurredAt: "2026-07-22T09:23:00+09:00",
    }))).toBe("REVIEW_PERMISSION_DENIED");
  });

  it.each([
    ["FAILED", "PASSED", "REQUIRED_EVIDENCE_FAILED"],
    ["NOT_EXECUTED", "PASSED", "REQUIRED_EVIDENCE_NOT_EXECUTED"],
    ["PARTIALLY_VERIFIED", "PASSED", "REQUIRED_EVIDENCE_INCOMPLETE"],
    ["PASSED", "MANUAL_REQUIRED", "MANUAL_CHECK_UNRESOLVED"],
  ] as const)("blocks readiness for automated=%s manual=%s", (automated, manual, expectedCode) => {
    const verifying = toVerifying(automated, manual);
    expect(failureCode(transitionChange(verifying, {
      target: "READY_TO_ACTIVATE",
      actor: APC_FIXTURE_ACTORS.reviewer,
      requestId: `cmd-ready-${expectedCode}`,
      occurredAt: "2026-07-22T10:00:00+09:00",
    }))).toBe(expectedCode);
  });

  it("reports every current gate blocker instead of only the first failure", () => {
    const implementing = toImplementing();
    const gate = selectVerificationGate(implementing);
    expect(gate.ready).toBe(false);
    expect(gate.blockers.map((blocker) => blocker.code)).toEqual([
      "REQUIRED_EVIDENCE_NOT_EXECUTED",
      "REQUIRED_EVIDENCE_NOT_EXECUTED",
    ]);
    expect(gate.blockers.map((blocker) => blocker.testId)).toEqual(["QA-DEMO-AUTO-01", "QA-DEMO-MANUAL-01"]);
  });

  it("does not reuse evidence after the implementation revision changes", () => {
    const firstVerification = toVerifying();
    const reimplementing = success(transitionChange(firstVerification, {
      target: "IMPLEMENTING",
      actor: APC_FIXTURE_ACTORS.requester,
      requestId: "cmd-reimplement",
      occurredAt: "2026-07-22T10:01:00+09:00",
    }));
    expect(reimplementing.implementation.revision).toBe(2);
    const verifyingAgain = success(transitionChange(reimplementing, {
      target: "VERIFYING",
      actor: APC_FIXTURE_ACTORS.reviewer,
      requestId: "cmd-reverify",
      occurredAt: "2026-07-22T10:02:00+09:00",
    }));
    expect(failureCode(transitionChange(verifyingAgain, {
      target: "READY_TO_ACTIVATE",
      actor: APC_FIXTURE_ACTORS.reviewer,
      requestId: "cmd-ready-stale-evidence",
      occurredAt: "2026-07-22T10:03:00+09:00",
    }))).toBe("REQUIRED_EVIDENCE_NOT_EXECUTED");
  });

  it("locks an approved proposal scope until a new review cycle", () => {
    const approved = approve();
    const current = selectCurrentProposal(approved);
    if (current === null) throw new Error("Fixture proposal missing");
    expect(failureCode(addProposalRevision(approved, {
      proposal: { ...current, revision: 2, summary: "승인 뒤 임의 확장" },
      actor: APC_FIXTURE_ACTORS.requester,
      requestId: "cmd-expand-approved-scope",
      occurredAt: "2026-07-22T09:25:00+09:00",
    }))).toBe("PROPOSAL_REVISION_LOCKED");
  });

  it("requires an admin and a new version to activate Context", () => {
    const ready = toReady();
    expect(failureCode(transitionChange(ready, {
      target: "ACTIVATED",
      activation: { version: "context-v1.4", documentIds: ["DOC-APC-CONTEXT"] },
      actor: APC_FIXTURE_ACTORS.reviewer,
      requestId: "cmd-activate-reviewer",
      occurredAt: "2026-07-22T10:10:00+09:00",
    }))).toBe("ACTIVATION_PERMISSION_DENIED");
    expect(failureCode(transitionChange(ready, {
      target: "ACTIVATED",
      actor: APC_FIXTURE_ACTORS.admin,
      requestId: "cmd-activate-no-version",
      occurredAt: "2026-07-22T10:10:00+09:00",
    }))).toBe("CONTEXT_VERSION_REQUIRED");
  });
});
