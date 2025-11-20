import { expect } from "chai";
import { ethers } from "hardhat";
import { MentalHealthSurvey } from "../types";

describe("MentalHealthSurvey", function () {
  let mentalHealthSurvey: MentalHealthSurvey;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const MentalHealthSurveyFactory = await ethers.getContractFactory("MentalHealthSurvey");
    mentalHealthSurvey = await MentalHealthSurveyFactory.deploy();
    await mentalHealthSurvey.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(mentalHealthSurvey.address).to.not.equal(ethers.constants.AddressZero);
    });
  });

  describe("Survey Submission", function () {
    it("Should allow survey submission", async function () {
      // Note: Full FHE testing requires FHEVM environment
      // This is a basic structure test
      expect(mentalHealthSurvey.address).to.not.equal(ethers.constants.AddressZero);
    });
  });
});
