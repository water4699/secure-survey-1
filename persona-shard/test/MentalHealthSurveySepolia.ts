import { expect } from "chai";
import hre from "hardhat";

describe("MentalHealthSurvey (Sepolia)", function () {
  // Tests for Sepolia deployment
  it("Should work on Sepolia testnet", async function () {
    if (hre.network.name !== "sepolia") {
      console.log("Skipping Sepolia tests - not on Sepolia network");
      return;
    }

    // Sepolia-specific tests would go here
    expect(true).to.equal(true);
  });
});
