import {
  APC_FIXTURE_ACTORS,
  createApcDomainFixture,
  recordReview,
  selectCurrentProposal,
  transitionChange,
} from "@entities/change-request";
import { getProposalScopeFingerprint } from "@entities/proposal";
import {
  canApproveRisk,
  getRolePermissions,
  hasPermission,
} from "@entities/review";

import type { DomainResult } from "@shared/lib/result";

function success<T>(result: DomainResult<T>): T {
  if (!result.ok) throw new Error(`${result.error.code}: ${result.error.detail}`);
  return result.value;
}

describe("role permissions", () => {
  it("resolves inherited permissions without granting high-risk approval to reviewers", () => {
    expect(getRolePermissions("admin").size).toBe(16);
    expect(hasPermission(APC_FIXTURE_ACTORS.requester, "git.publish_approved_change")).toBe(true);
    expect(hasPermission(APC_FIXTURE_ACTORS.admin, "project.read")).toBe(true);
    expect(hasPermission(APC_FIXTURE_ACTORS.reviewer, "evidence.accept_manual")).toBe(true);
    expect(canApproveRisk(APC_FIXTURE_ACTORS.reviewer, "MEDIUM")).toBe(true);
    expect(canApproveRisk(APC_FIXTURE_ACTORS.reviewer, "HIGH")).toBe(false);
    expect(canApproveRisk(APC_FIXTURE_ACTORS.admin, "HIGH")).toBe(true);
  });

  it("allows the explicitly marked demo-only self approval exception", () => {
    const analyzed = createApcDomainFixture().aggregate;
    const inReview = success(transitionChange(analyzed, {
      target: "IN_REVIEW",
      actor: APC_FIXTURE_ACTORS.requester,
      requestId: "cmd-demo-in-review",
      occurredAt: "2026-07-22T11:00:00+09:00",
    }));
    const proposal = selectCurrentProposal(inReview);
    if (proposal === null) throw new Error("Fixture proposal missing");
    const reviewed = recordReview(inReview, {
      id: "review-demo-self",
      decision: "APPROVED",
      proposalRevision: proposal.revision,
      scopeFingerprint: getProposalScopeFingerprint(proposal),
      comment: "데모 전용 self approval",
      actor: { ...APC_FIXTURE_ACTORS.requester, role: "reviewer" },
      requestId: "cmd-demo-self-review",
      occurredAt: "2026-07-22T11:01:00+09:00",
      allowFixtureSelfApproval: true,
    });
    expect(reviewed.ok).toBe(true);
  });
});
