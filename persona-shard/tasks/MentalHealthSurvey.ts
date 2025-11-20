import { task } from "hardhat/config";

task("survey:info", "Get survey information")
  .setAction(async (taskArgs, hre) => {
    const { deployments } = hre;
    const MentalHealthSurvey = await deployments.get("MentalHealthSurvey");

    console.log("MentalHealthSurvey deployed at:", MentalHealthSurvey.address);
  });
