import { render, screen } from "@testing-library/react";
import { SecurityWarning, analyzeTransaction } from "@/components/SecurityWarning";
import { describe, it, expect } from "vitest";

describe("SecurityWarning", () => {
  it("shows unlimited approval warning", () => {
    const tx = {
      data: "0x095ea7b30000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    };
    render(<SecurityWarning transaction={tx} />);
    expect(screen.getByText("⚠️ Unlimited Token Approval")).toBeInTheDocument();
  });

  it("shows dangerous signature warning", () => {
    const tx = {
      data: "0x1cff79cd0000000000000000000000000000000000000000000000000000000000000000",
    };
    render(<SecurityWarning transaction={tx} />);
    expect(
      screen.getByText("⚠️ Potentially Dangerous Transaction")
    ).toBeInTheDocument();
  });

  it("shows high gas price warning", () => {
    const tx = {
      gasPrice: "100000000000", // 100 Gwei
    };
    render(<SecurityWarning transaction={tx} />);
    expect(screen.getByText("⚠️ High Gas Price")).toBeInTheDocument();
  });
});

describe("analyzeTransaction", () => {
  it("detects unlimited approval", () => {
    const tx = {
      data: "0x095ea7b30000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    };
    const warnings = analyzeTransaction(tx);
    expect(warnings.some((w) => w.type === "unlimited_approval")).toBe(true);
  });

  it("returns empty array for safe transaction", () => {
    const tx = {
      to: "0x1234",
      value: "1000000000000000000", // 1 ETH
    };
    const warnings = analyzeTransaction(tx);
    expect(warnings).toHaveLength(0);
  });
});
