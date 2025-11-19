const { ethers, deployments } = require('hardhat');

async function main() {
  console.log('Checking IncomeSurvey contract on Sepolia...');

  // Get the deployed contract
  const IncomeSurveyDeployment = await deployments.get('IncomeSurvey');
  const IncomeSurvey = await ethers.getContractAt('IncomeSurvey', IncomeSurveyDeployment.address);
  console.log('Contract address:', IncomeSurvey.target);

  // Check total participants
  const totalParticipants = await IncomeSurvey.totalParticipants();
  console.log('Total participants:', totalParticipants.toString());

  // Check owner
  const owner = await IncomeSurvey.owner();
  console.log('Contract owner:', owner);

  console.log('✅ Contract check completed successfully!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
