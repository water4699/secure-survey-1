const { ethers, deployments } = require('hardhat');

async function testLocalhostContract() {
  try {
    console.log('Testing localhost contract...');

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

    // Check statistics
    const stats = await IncomeSurvey.getAllStatistics();
    console.log('Statistics:', {
      range1: stats[0].toString(),
      range2: stats[1].toString(),
      range3: stats[2].toString()
    });

    console.log('✅ Localhost contract test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing localhost contract:', error.message);
  }
}

testLocalhostContract();
