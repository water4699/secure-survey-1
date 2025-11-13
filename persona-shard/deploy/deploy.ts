import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  console.log("Deploying MentalHealthSurvey with account:", deployer);

  const mentalHealthSurvey = await deploy("MentalHealthSurvey", {
    from: deployer,
    log: true,
  });

  console.log("MentalHealthSurvey deployed to:", mentalHealthSurvey.address);
};

export default func;
func.tags = ["MentalHealthSurvey"];
