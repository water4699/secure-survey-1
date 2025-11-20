// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title GamePreferenceSurvey - Encrypted Game Preference Survey System
/// @author TrueShield Team
/// @notice A survey system for collecting encrypted game mechanism preferences (PVP/PVE/Economic System)
/// @dev Uses FHE for privacy-preserving preference collection with homomorphic addition
contract GamePreferenceSurvey is SepoliaConfig {
    address public admin;
    
    struct Survey {
        string title;
        string description;
        uint256 deadline;
        bool active;
        // Encrypted counters for each game mechanism (PVP, PVE, Economic System, Others)
        euint8 totalPVP;
        euint8 totalPVE;
        euint8 totalEconomic;
        euint8 totalOthers;
        uint256 totalResponses;
        mapping(address => bool) hasResponded;
    }

    mapping(uint256 => Survey) public surveys;
    uint256 public surveyCount;

    event SurveyCreated(uint256 indexed surveyId, string title, uint256 deadline);
    event ResponseSubmitted(uint256 indexed surveyId, address indexed respondent);
    event SurveyClosed(uint256 indexed surveyId);
    event ResultsDecrypted(uint256 indexed surveyId, uint8 pvp, uint8 pve, uint8 economic, uint8 others);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Create a new survey
    /// @param _title The title of the survey
    /// @param _description The description of the survey
    /// @param _durationInSeconds The duration of the survey period in seconds
    /// @return The ID of the newly created survey
    function createSurvey(
        string memory _title,
        string memory _description,
        uint256 _durationInSeconds
    ) external returns (uint256) {
        uint256 surveyId = surveyCount++;
        Survey storage survey = surveys[surveyId];
        
        survey.title = _title;
        survey.description = _description;
        survey.deadline = block.timestamp + _durationInSeconds;
        survey.active = true;
        survey.totalResponses = 0;
        
        // Initialize encrypted counters to 0
        survey.totalPVP = FHE.asEuint8(0);
        survey.totalPVE = FHE.asEuint8(0);
        survey.totalEconomic = FHE.asEuint8(0);
        survey.totalOthers = FHE.asEuint8(0);

        emit SurveyCreated(surveyId, _title, survey.deadline);
        return surveyId;
    }

    /// @notice Submit encrypted preferences for a survey
    /// @param _surveyId The ID of the survey
    /// @param inputPVP Encrypted preference for PVP (0 or 1)
    /// @param inputPVE Encrypted preference for PVE (0 or 1)
    /// @param inputEconomic Encrypted preference for Economic System (0 or 1)
    /// @param inputOthers Encrypted preference for Others (0 or 1)
    /// @param proofPVP Input proof for PVP encryption
    /// @param proofPVE Input proof for PVE encryption
    /// @param proofEconomic Input proof for Economic encryption
    /// @param proofOthers Input proof for Others encryption
    function submitResponse(
        uint256 _surveyId,
        externalEuint8 inputPVP,
        externalEuint8 inputPVE,
        externalEuint8 inputEconomic,
        externalEuint8 inputOthers,
        bytes calldata proofPVP,
        bytes calldata proofPVE,
        bytes calldata proofEconomic,
        bytes calldata proofOthers
    ) external {
        Survey storage survey = surveys[_surveyId];
        
        require(survey.active, "Survey is not active");
        require(block.timestamp < survey.deadline, "Survey period has ended");
        require(!survey.hasResponded[msg.sender], "You have already responded");

        // Convert external encrypted inputs to internal encrypted values
        euint8 encPVP = FHE.fromExternal(inputPVP, proofPVP);
        euint8 encPVE = FHE.fromExternal(inputPVE, proofPVE);
        euint8 encEconomic = FHE.fromExternal(inputEconomic, proofEconomic);
        euint8 encOthers = FHE.fromExternal(inputOthers, proofOthers);
        
        // Homomorphic addition to aggregate responses
        survey.totalPVP = FHE.add(survey.totalPVP, encPVP);
        survey.totalPVE = FHE.add(survey.totalPVE, encPVE);
        survey.totalEconomic = FHE.add(survey.totalEconomic, encEconomic);
        survey.totalOthers = FHE.add(survey.totalOthers, encOthers);

        survey.hasResponded[msg.sender] = true;
        survey.totalResponses++;

        // Allow admin to decrypt the totals
        FHE.allowThis(survey.totalPVP);
        FHE.allow(survey.totalPVP, admin);
        FHE.allowThis(survey.totalPVE);
        FHE.allow(survey.totalPVE, admin);
        FHE.allowThis(survey.totalEconomic);
        FHE.allow(survey.totalEconomic, admin);
        FHE.allowThis(survey.totalOthers);
        FHE.allow(survey.totalOthers, admin);

        emit ResponseSubmitted(_surveyId, msg.sender);
    }

    /// @notice Request decryption access for survey totals (anyone can call)
    /// @param _surveyId The ID of the survey
    function requestDecryptionAccess(uint256 _surveyId) external {
        require(_surveyId < surveyCount, "Survey does not exist");
        Survey storage survey = surveys[_surveyId];
        
        // Grant decryption access to the caller
        FHE.allow(survey.totalPVP, msg.sender);
        FHE.allow(survey.totalPVE, msg.sender);
        FHE.allow(survey.totalEconomic, msg.sender);
        FHE.allow(survey.totalOthers, msg.sender);
    }

    /// @notice Close a survey (only admin)
    /// @param _surveyId The ID of the survey
    function closeSurvey(uint256 _surveyId) external onlyAdmin {
        Survey storage survey = surveys[_surveyId];
        require(survey.active, "Survey is already closed");
        
        survey.active = false;
        emit SurveyClosed(_surveyId);
    }

    /// @notice Get encrypted totals for a survey
    /// @param _surveyId The ID of the survey
    /// @return pvp The encrypted total for PVP
    /// @return pve The encrypted total for PVE
    /// @return economic The encrypted total for Economic System
    /// @return others The encrypted total for Others
    function getEncryptedTotals(uint256 _surveyId) 
        external 
        view 
        returns (
            euint8 pvp,
            euint8 pve,
            euint8 economic,
            euint8 others
        ) 
    {
        Survey storage survey = surveys[_surveyId];
        return (
            survey.totalPVP,
            survey.totalPVE,
            survey.totalEconomic,
            survey.totalOthers
        );
    }

    /// @notice Get survey details
    /// @param _surveyId The ID of the survey
    /// @return title The survey title
    /// @return description The survey description
    /// @return deadline The survey deadline
    /// @return active Whether the survey is active
    /// @return totalResponses The total number of responses
    function getSurvey(uint256 _surveyId)
        external
        view
        returns (
            string memory title,
            string memory description,
            uint256 deadline,
            bool active,
            uint256 totalResponses
        )
    {
        Survey storage survey = surveys[_surveyId];
        return (
            survey.title,
            survey.description,
            survey.deadline,
            survey.active,
            survey.totalResponses
        );
    }

    /// @notice Check if an address has responded to a survey
    /// @param _surveyId The ID of the survey
    /// @param _respondent The address to check
    /// @return Whether the address has responded
    function hasResponded(uint256 _surveyId, address _respondent) external view returns (bool) {
        return surveys[_surveyId].hasResponded[_respondent];
    }

    /// @notice Transfer admin rights
    /// @param _newAdmin The new admin address
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }

    /// @notice Get the current admin address
    /// @return The current admin address
    function getAdmin() external view returns (address) {
        return admin;
    }

    /// @notice Get the total number of surveys
    /// @return The total number of surveys
    function getSurveyCount() external view returns (uint256) {
        return surveyCount;
    }
}

