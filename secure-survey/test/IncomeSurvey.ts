import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { IncomeSurvey, IncomeSurvey__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("IncomeSurvey")) as IncomeSurvey__factory;
  const incomeSurveyContract = (await factory.deploy()) as IncomeSurvey;
  const incomeSurveyContractAddress = await incomeSurveyContract.getAddress();

  return { incomeSurveyContract, incomeSurveyContractAddress };
}

describe("IncomeSurvey", function () {
  let signers: Signers;
  let incomeSurveyContract: IncomeSurvey;
  let incomeSurveyContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ incomeSurveyContract, incomeSurveyContractAddress } = await deployFixture());
  });

  it("should submit plain text income survey response", async function () {
    // Submit plain text survey response for localhost testing
    const tx = await incomeSurveyContract
      .connect(signers.alice)
      .submitPlainSurvey(2); // Select option 2 ($3-6k)
    await tx.wait();

    // Verify user has submitted
    const hasResponse = await incomeSurveyContract.connect(signers.alice).hasSurveyResponse();
    expect(hasResponse).to.be.true;

    // Check total participants
    const totalParticipants = await incomeSurveyContract.totalParticipants();
    expect(totalParticipants).to.eq(1);
  });

  it("should handle basic contract functionality", async function () {
    // Test basic contract state
    const totalParticipants = await incomeSurveyContract.totalParticipants();
    expect(totalParticipants).to.eq(0);

    // Test contract owner
    const owner = await incomeSurveyContract.owner();
    expect(owner).to.not.be.undefined;

    // Note: FHE operations are tested separately due to Hardhat environment limitations
  });

  it("should prevent duplicate submissions", async function () {
    // Alice submits first time
    let tx = await incomeSurveyContract
      .connect(signers.alice)
      .submitPlainSurvey(3); // Select option 3 (>= $6k)
    await tx.wait();

    // Alice tries to submit again - should fail
    await expect(
      incomeSurveyContract
        .connect(signers.alice)
        .submitPlainSurvey(1)
    ).to.be.revertedWith("User has already submitted a survey");
  });

  it("should allow multiple users to submit surveys", async function () {
    // Alice submits survey
    await incomeSurveyContract
      .connect(signers.alice)
      .submitPlainSurvey(1); // Alice selects option 1 (< $3k)

    // Bob submits survey
    await incomeSurveyContract
      .connect(signers.bob)
      .submitPlainSurvey(2); // Bob selects option 2 ($3-6k)

    // Check total participants
    const totalParticipants = await incomeSurveyContract.totalParticipants();
    expect(totalParticipants).to.eq(2);
  });
});
