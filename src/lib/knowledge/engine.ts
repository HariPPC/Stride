import type {
  JourneyId,
  KnowledgeAnswer,
  RoleLens,
  SourceRef,
} from "./types";

const checkoutSources: SourceRef[] = [
  {
    id: "src-checkout-controller",
    title: "CheckoutController.validateStep()",
    kind: "code",
    path: "services/checkout/src/CheckoutController.ts#L118",
    note: "Implementation-derived validation sequence",
  },
  {
    id: "src-payment-gateway",
    title: "PaymentGateway.authorize()",
    kind: "code",
    path: "services/payments/src/PaymentGateway.ts#L64",
  },
  {
    id: "jira-chk-214",
    title: "CHK-214 Checkout eligibility rules",
    kind: "jira",
    path: "Jira / CHK-214",
    note: "Accepted AC for guest vs registered checkout",
  },
  {
    id: "conf-checkout-journey",
    title: "Checkout journey current state",
    kind: "confluence",
    path: "Confluence / Commerce / Checkout",
  },
  {
    id: "ux-checkout-v3",
    title: "Checkout desktop + mobile states",
    kind: "ux",
    path: "Figma / Checkout v3 / Frames 01–12",
  },
  {
    id: "test-chk-regression",
    title: "Checkout regression pack",
    kind: "test",
    path: "TestRail / CHK-REG-01",
  },
  {
    id: "rel-2025-q3",
    title: "Q3 Commerce release notes",
    kind: "release",
    path: "Release / 2025.Q3.14",
  },
];

function lensLead(lens: RoleLens): string {
  switch (lens) {
    case "business":
      return "Business view — focused on customer outcomes, policy, and decision context.";
    case "ux":
      return "UX view — focused on screens, states, interaction patterns, and visual gaps.";
    case "qa":
      return "QA view — focused on verifiable rules, exceptions, and draft test angles.";
    case "engineering":
      return "Engineering view — focused on modules, APIs, dependencies, and ownership.";
  }
}

function functionality(lens: RoleLens): KnowledgeAnswer {
  return {
    useCase: "functionality",
    title: "How Checkout works today",
    summary: `${lensLead(lens)} Checkout is a four-stage journey: Cart review → Shipping & eligibility → Payment validation → Order confirmation. Confirmed current behavior below is linked to code and approved sources.`,
    sections: [
      {
        title: "Journey steps",
        items: [
          "Cart review loads line items, promos, and inventory holds from Cart Service.",
          "Shipping & eligibility checks address completeness, shipping method, and customer state (guest / registered / B2B).",
          "Payment validation runs card/token checks, AVS where enabled, and fraud scoring before authorization.",
          "Order confirmation creates the order record, emits fulfillment events, and renders receipt + next-step messaging.",
        ],
      },
      {
        title: "Key validations",
        items: [
          "Empty cart blocks progression (code + CHK-214).",
          "Restricted SKUs require eligibility flags before payment step.",
          "Payment step requires a selected shipping method except for digital-only carts.",
        ],
      },
      {
        title:
          lens === "ux"
            ? "UX touchpoints"
            : lens === "engineering"
              ? "Primary modules"
              : "Known exceptions",
        items:
          lens === "ux"
            ? [
                "Desktop: 4 primary screens + 6 error overlays in Figma Checkout v3.",
                "Mobile: condensed stepper with sticky payment CTA.",
                "Error states exist for inventory failure, address reject, and payment decline.",
              ]
            : lens === "engineering"
              ? [
                  "CheckoutController orchestrates step transitions.",
                  "PaymentGateway wraps authorize/capture; FraudScore is async side-call.",
                  "OrderService publishes OrderCreated to fulfillment queue.",
                ]
              : [
                  "Partial shipments allowed only when split-fulfillment flag is on.",
                  "Guest checkout disables saved-payment wallets.",
                  "B2B purchase orders skip card authorization and use invoice hold.",
                ],
      },
    ],
    sources: checkoutSources.slice(0, 5),
    conflicts: [
      {
        topic: "Guest wallet visibility",
        statements: [
          "Confluence says guest users never see saved wallets.",
          "Checkout v2 mobile prototype still shows a disabled wallet row.",
        ],
        action: "Treat Confluence + code as current; mark Figma v2 frame outdated pending UX cleanup.",
      },
    ],
    gaps: [
      {
        topic: "Offline payment retry UX",
        detail:
          "No approved screenshot for network-timeout retry on payment step.",
      },
    ],
    confidence: "high",
    ownership: ["Checkout Squad", "Payments Platform", "Commerce UX"],
  };
}

function rules(lens: RoleLens): KnowledgeAnswer {
  return {
    useCase: "rules",
    title: "Rules governing payment progression",
    summary: `${lensLead(lens)} Customers can proceed to payment only when cart, eligibility, and shipping preconditions pass. Rules are grouped with source links and confidence markers.`,
    sections: [
      {
        title: "Standard rules",
        items: [
          "Cart must contain ≥1 in-stock sellable item.",
          "Shipping address must pass country + postal validation.",
          "A shipping method must be selected unless cart is digital-only.",
          "Customer must accept terms if legal region requires explicit consent.",
        ],
      },
      {
        title: "Conditional rules",
        items: [
          "If any SKU is age-restricted, DOB verification must succeed before payment.",
          "If promo requires membership, membership status must be active.",
          "If fraud score ≥ threshold, step-up challenge is required before authorize.",
        ],
      },
      {
        title: "Exceptions",
        items: [
          "B2B invoice customers skip card authorize and enter purchase-order mode.",
          "Store-credit-only carts can skip external payment gateway when balance covers total.",
        ],
      },
      ...(lens === "qa"
        ? [
            {
              title: "QA checklist format",
              items: [
                "Verify empty cart CTA remains disabled.",
                "Verify age-restricted SKU blocks payment until DOB passes.",
                "Verify B2B PO path never calls PaymentGateway.authorize().",
                "Verify fraud step-up appears when score ≥ threshold.",
              ],
            },
          ]
        : []),
    ],
    sources: [
      checkoutSources[0],
      checkoutSources[2],
      checkoutSources[3],
      checkoutSources[5],
    ],
    conflicts: [
      {
        topic: "Fraud threshold value",
        statements: [
          "Code uses threshold 72 in FraudScore.evaluate().",
          "CHK-214 AC still documents threshold 65.",
        ],
        action:
          "Flag for business validation — do not treat either value as approved policy until reconciled.",
      },
    ],
    gaps: [
      {
        topic: "International consent copy",
        detail:
          "Region-specific terms acceptance text not linked for DE/FR locales.",
      },
    ],
    confidence: "medium",
    ownership: ["Checkout Squad", "Risk & Fraud"],
  };
}

function uxFlow(lens: RoleLens): KnowledgeAnswer {
  return {
    useCase: "ux",
    title: "Existing Checkout screens and error states",
    summary: `${lensLead(lens)} Available UX artifacts for Checkout are grouped by journey stage. Missing visuals are listed as knowledge gaps — not invented.`,
    sections: [
      {
        title: "Cart review",
        items: [
          "Desktop: CartReview / Default, PromoApplied, InventoryWarning.",
          "Mobile: CartReview_m / Default, StickyCTA.",
        ],
      },
      {
        title: "Shipping & eligibility",
        items: [
          "AddressForm / Empty, Prefill, ValidationError.",
          "EligibilityGate / RestrictedSKU, MembershipRequired.",
        ],
      },
      {
        title: "Payment",
        items: [
          "Payment / CardEntry, WalletSelect (registered only), FraudStepUp.",
          "Errors: DeclineSoft, DeclineHard, AVSMismatch, NetworkTimeout (text-only — no approved frame).",
        ],
      },
      {
        title: "Confirmation",
        items: [
          "OrderConfirm / Success, PartialShipmentNotice.",
          "No approved empty-state for failed confirmation render.",
        ],
      },
    ],
    sources: [checkoutSources[4], checkoutSources[3], checkoutSources[6]],
    conflicts: [
      {
        topic: "Payment decline copy",
        statements: [
          "Figma DeclineSoft uses “Try another card”.",
          "Production string catalog uses “Payment could not be completed”.",
        ],
        action: "Flag design ↔ production mismatch for UX + content review.",
      },
    ],
    gaps: [
      {
        topic: "NetworkTimeout visual",
        detail: "No approved screenshot; only error code mapping in test evidence.",
      },
      {
        topic: "Accessibility annotations",
        detail: "Focus order notes missing for FraudStepUp modal.",
      },
    ],
    confidence: "medium",
    ownership: ["Commerce UX", "Checkout Squad"],
  };
}

function edgeCases(lens: RoleLens): KnowledgeAnswer {
  return {
    useCase: "edge",
    title: "Known Checkout edge cases",
    summary: `${lensLead(lens)} Non-happy paths from defects, test evidence, and production learnings. Resolved historical issues are separated from current behavior.`,
    sections: [
      {
        title: "Current known exceptions",
        items: [
          "Inventory drops between cart and payment → soft fail with refresh prompt (CHK-DEF-88).",
          "AVS mismatch on international cards → soft decline with address edit path.",
          "Partial digital + physical cart → shipping required only for physical lines.",
          "Session expiry mid-payment → restore cart, do not re-authorize blindly.",
        ],
      },
      {
        title: "Resolved historical issues",
        items: [
          "Double-submit creating duplicate orders — fixed in 2025.Q2.09 via idempotency key.",
          "Promo stacking overflow on guest carts — closed; capped in pricing engine.",
        ],
      },
      ...(lens === "qa"
        ? [
            {
              title: "Draft test scenarios",
              items: [
                "Negative: remove last in-stock item during payment authorize latency.",
                "Boundary: fraud score exactly at threshold.",
                "Regression: digital-only cart skips shipping method requirement.",
                "Integration: OrderCreated not emitted when authorize fails.",
              ],
            },
          ]
        : []),
    ],
    sources: [checkoutSources[5], checkoutSources[6], checkoutSources[2]],
    conflicts: [],
    gaps: [
      {
        topic: "Wallet token revocation mid-checkout",
        detail:
          "Expected behavior not documented; label as unresolved for discovery.",
      },
    ],
    confidence: "high",
    ownership: ["QA Commerce", "Checkout Squad"],
  };
}

function impact(lens: RoleLens): KnowledgeAnswer {
  return {
    useCase: "impact",
    title: "Impact if Checkout validation changes",
    summary: `${lensLead(lens)} Changing Checkout validation may touch rules, UI states, payments, fraud, and downstream fulfillment. Impacts are grouped as direct, dependent, or uncertain.`,
    sections: [
      {
        title: "Direct impact",
        items: [
          "CheckoutController step guards and client validation mirrors.",
          "Payment progression gating and error messaging.",
          "CHK-214 acceptance criteria and related regression tests.",
        ],
      },
      {
        title: "Dependent areas",
        items: [
          "Fraud step-up entry conditions.",
          "Eligibility service responses for restricted SKUs.",
          "Analytics funnel events (checkout_step_completed).",
          "Order Service precondition checks before create.",
        ],
      },
      {
        title: "Uncertain / needs review",
        items: [
          "B2B invoice path may inherit or bypass new validation — confirm with B2B squad.",
          "Mobile wallet SDK may cache prior eligibility decisions.",
        ],
      },
      {
        title: "Suggested reviewers",
        items: [
          "Checkout Squad (owner)",
          "Payments Platform",
          "Risk & Fraud",
          "Commerce UX",
          "QA Commerce",
        ],
      },
    ],
    sources: [
      checkoutSources[0],
      checkoutSources[1],
      checkoutSources[2],
      checkoutSources[5],
    ],
    conflicts: [],
    gaps: [
      {
        topic: "Partner marketplace carts",
        detail:
          "Dependency map incomplete for third-party seller carts in Checkout.",
      },
    ],
    confidence: "medium",
    ownership: ["Checkout Squad", "Payments Platform", "Risk & Fraud"],
  };
}

function decision(lens: RoleLens): KnowledgeAnswer {
  return {
    useCase: "decision",
    title: "Why guest checkout disables wallets",
    summary: `${lensLead(lens)} Decision history found for wallet visibility on guest checkout. Where rationale is missing, the gap is explicit.`,
    sections: [
      {
        title: "Recorded rationale",
        items: [
          "CHK-214 decision: guest sessions must not surface saved payment instruments to reduce account-takeover confusion and PCI scope creep.",
          "Release 2025.Q1 note: wallet row removed from guest Payment frame after incident review.",
        ],
      },
      {
        title: "What remains unverified",
        items: [
          "No ADR found for whether guest checkout should allow one-time wallet tokens from device OS.",
        ],
      },
    ],
    sources: [checkoutSources[2], checkoutSources[6], checkoutSources[4]],
    conflicts: [
      {
        topic: "One-time device wallets",
        statements: [
          "Engineering spike notes suggest Apple Pay guest may be allowed.",
          "Approved Confluence policy still says “no wallets for guests”.",
        ],
        action: "Present both; require business validation before treating as policy.",
      },
    ],
    gaps: [
      {
        topic: "Original incident ticket",
        detail: "Linked incident ID referenced in release notes is not in the indexed corpus.",
      },
    ],
    confidence: "medium",
    ownership: ["Checkout Squad", "Security / PCI", "Commerce UX"],
  };
}

function contextPack(lens: RoleLens): KnowledgeAnswer {
  return {
    useCase: "context-pack",
    title: "Checkout discovery context pack",
    summary: `${lensLead(lens)} Structured current-state brief for discovery. This is a starting point for workshops — not a replacement for human review.`,
    sections: [
      {
        title: "Verified current state",
        items: [
          "Four-stage Checkout journey with eligibility and payment gates.",
          "Guest checkout hides saved wallets; B2B can use invoice hold.",
          "Fraud step-up exists; threshold conflict noted (code 72 vs AC 65).",
        ],
      },
      {
        title: "Constraints & dependencies",
        items: [
          "Payments Platform authorize/capture contract.",
          "Eligibility service for restricted SKUs.",
          "Analytics funnel event schema.",
        ],
      },
      {
        title: "UX & QA highlights",
        items: [
          "Figma Checkout v3 covers primary states; NetworkTimeout visual missing.",
          "Regression pack CHK-REG-01 covers core paths; wallet revocation unresolved.",
        ],
      },
      {
        title: "Open discovery questions",
        items: [
          "Reconcile fraud threshold policy.",
          "Confirm partner marketplace cart impact.",
          "Decide guest one-time device wallet stance.",
          "Produce approved NetworkTimeout payment retry frame.",
        ],
      },
    ],
    sources: checkoutSources,
    conflicts: [
      {
        topic: "Fraud threshold",
        statements: ["Code: 72", "CHK-214 AC: 65"],
        action: "Carry into discovery agenda as decision gate.",
      },
    ],
    gaps: [
      {
        topic: "Ownership for marketplace checkout",
        detail: "No named owner in indexed sources.",
      },
    ],
    confidence: "high",
    ownership: ["Business Manager (reviewer)", "Checkout Squad", "Commerce UX"],
  };
}

function payrollFallback(lens: RoleLens): KnowledgeAnswer {
  return {
    useCase: "fallback",
    title: "Payroll API benchmark scope",
    summary: `${lensLead(lens)} Payroll API is the validation benchmark journey. This prototype indexes Checkout as the interactive pilot; Payroll answers are limited to readiness framing.`,
    sections: [
      {
        title: "Benchmark intent",
        items: [
          "Use pre-implementation Payroll API artifacts to score functionality accuracy, rule completeness, dependency coverage, and traceability.",
          "Compare agent output against implemented behavior and SME understanding before expanding specialized agents.",
        ],
      },
      {
        title: "Readiness gate reminders",
        items: [
          "Every material claim needs a source.",
          "Conflicts and gaps must surface — never invent.",
          "Human review remains mandatory for decisions.",
        ],
      },
    ],
    sources: [
      {
        id: "payroll-bench",
        title: "Payroll API validation plan",
        kind: "confluence",
        path: "Confluence / AI Ecom Guide / Phase 3",
      },
    ],
    conflicts: [],
    gaps: [
      {
        topic: "Payroll API corpus",
        detail:
          "Full Payroll API knowledge pack is not loaded in this UI prototype.",
      },
    ],
    confidence: "low",
    ownership: ["Knowledge Base owners"],
  };
}

function fallback(lens: RoleLens, journey: JourneyId): KnowledgeAnswer {
  if (journey === "payroll-api") return payrollFallback(lens);
  return {
    useCase: "fallback",
    title: "I can help with current-state discovery",
    summary: `${lensLead(lens)} Ask about how a journey works, business rules, UX screens, edge cases, impact of a change, decision history, or request a discovery context pack. For this MVP pilot, Checkout is fully seeded.`,
    sections: [
      {
        title: "Try asking",
        items: [
          "How does Checkout currently work?",
          "What rules determine whether a customer can proceed to payment?",
          "Show existing Checkout screens and error states.",
          "What known edge cases exist for Checkout?",
          "If we change Checkout validation, what else may be affected?",
          "Why does guest checkout disable wallets?",
          "Prepare a discovery context pack for Checkout.",
        ],
      },
    ],
    sources: [],
    conflicts: [],
    gaps: [
      {
        topic: "Unmatched question",
        detail:
          "No indexed match for this phrasing yet. Refine the question or switch journey.",
      },
    ],
    confidence: "low",
  };
}

export function answerQuestion(
  question: string,
  journey: JourneyId,
  lens: RoleLens,
): KnowledgeAnswer {
  const q = question.toLowerCase();

  if (journey === "payroll-api") {
    if (
      q.includes("payroll") ||
      q.includes("benchmark") ||
      q.includes("how") ||
      q.includes("rule") ||
      q.includes("depend")
    ) {
      return payrollFallback(lens);
    }
  }

  if (
    q.includes("context pack") ||
    q.includes("discovery pack") ||
    q.includes("brief") ||
    q.includes("prepare")
  ) {
    return contextPack(lens);
  }

  if (
    q.includes("why") ||
    q.includes("decision") ||
    q.includes("rationale") ||
    q.includes("wallet")
  ) {
    return decision(lens);
  }

  if (
    q.includes("impact") ||
    q.includes("affect") ||
    q.includes("depend") ||
    q.includes("change")
  ) {
    return impact(lens);
  }

  if (
    q.includes("edge") ||
    q.includes("exception") ||
    q.includes("failure") ||
    q.includes("defect")
  ) {
    return edgeCases(lens);
  }

  if (
    q.includes("screen") ||
    q.includes("figma") ||
    q.includes("ux") ||
    q.includes("error state") ||
    q.includes("screenshot")
  ) {
    return uxFlow(lens);
  }

  if (
    q.includes("rule") ||
    q.includes("validation") ||
    q.includes("proceed to payment") ||
    q.includes("can proceed")
  ) {
    return rules(lens);
  }

  if (
    q.includes("how does") ||
    q.includes("how do") ||
    q.includes("currently work") ||
    q.includes("functionality") ||
    q.includes("journey") ||
    q.includes("checkout")
  ) {
    return functionality(lens);
  }

  return fallback(lens, journey);
}
