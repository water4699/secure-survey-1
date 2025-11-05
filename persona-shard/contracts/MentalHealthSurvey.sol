// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Mental Health Survey Contract
/// @notice Privacy-preserving mental wellness assessment using Fully Homomorphic Encryption (FHE)
/// @dev Users submit encrypted answers to mental health questions and receive an encrypted stress/anxiety index
/// @dev Formula: stress_index = Σ(answer_i * weight_i) where weights represent question importance
contract MentalHealthSurvey is SepoliaConfig {
    /// @notice Structure to store encrypted survey responses
    /// @dev All mental health data is encrypted to protect user privacy
    struct SurveyResponse {
        euint32 q1_sleep_quality; // Sleep quality (1-10): weight 4
        euint32 q2_stress_level; // Daily stress level (1-10): weight 6
        euint32 q3_mood; // Overall mood (1-10): weight 5
        euint32 q4_anxiety; // Anxiety frequency (1-10): weight 7
        euint32 q5_social_connection; // Social connection quality (1-10): weight 3
        euint32 stressIndex; // Calculated encrypted stress/anxiety index
        uint256 timestamp; // Submission timestamp
        bool exists; // Flag to check if response exists
    }

    /// @notice Mapping from user address to their encrypted survey responses
    mapping(address => SurveyResponse) private responses;

    /// @notice Array to track all users who have submitted surveys
    address[] private participants;

    /// @notice Event emitted when a survey is submitted
    event SurveySubmitted(address indexed user, uint256 timestamp);

    /// @notice Event emitted when stress index is calculated
    event StressIndexCalculated(address indexed user, uint256 timestamp);

    /// @notice Submit encrypted mental health survey responses
    /// @param _q1 Encrypted sleep quality (1-10 scale)
    /// @param _q1Proof Proof for q1 encryption
    /// @param _q2 Encrypted stress level (1-10 scale)
    /// @param _q2Proof Proof for q2 encryption
    /// @param _q3 Encrypted mood (1-10 scale)
    /// @param _q3Proof Proof for q3 encryption
    /// @param _q4 Encrypted anxiety frequency (1-10 scale)
    /// @param _q4Proof Proof for q4 encryption
    /// @param _q5 Encrypted social connection (1-10 scale)
    /// @param _q5Proof Proof for q5 encryption
    /// @dev Calculates stress index using weighted formula: 4*q1 + 6*q2 + 5*q3 + 7*q4 + 3*q5
    /// @dev Higher weight means the question has more impact on the final stress index
    function submitSurvey(
        externalEuint32 _q1,
        bytes calldata _q1Proof,
        externalEuint32 _q2,
        bytes calldata _q2Proof,
        externalEuint32 _q3,
        bytes calldata _q3Proof,
        externalEuint32 _q4,
        bytes calldata _q4Proof,
        externalEuint32 _q5,
        bytes calldata _q5Proof
    ) external {
        // Convert external encrypted inputs to internal encrypted values
        euint32 encQ1 = FHE.fromExternal(_q1, _q1Proof);
        euint32 encQ2 = FHE.fromExternal(_q2, _q2Proof);
        euint32 encQ3 = FHE.fromExternal(_q3, _q3Proof);
        euint32 encQ4 = FHE.fromExternal(_q4, _q4Proof);
        euint32 encQ5 = FHE.fromExternal(_q5, _q5Proof);

        // Calculate stress index using homomorphic operations
        // Formula: stress_index = 4*q1 + 6*q2 + 5*q3 + 7*q4 + 3*q5
        // Weights explanation:
        // - q1 (sleep): 4 - Important but indirect indicator
        // - q2 (stress): 6 - Direct stress measure, high weight
        // - q3 (mood): 5 - Strong indicator of mental state
        // - q4 (anxiety): 7 - Highest weight, most critical for stress assessment
        // - q5 (social): 3 - Supporting factor, lower weight
        euint32 weighted1 = FHE.mul(encQ1, FHE.asEuint32(4));
        euint32 weighted2 = FHE.mul(encQ2, FHE.asEuint32(6));
        euint32 weighted3 = FHE.mul(encQ3, FHE.asEuint32(5));
        euint32 weighted4 = FHE.mul(encQ4, FHE.asEuint32(7));
        euint32 weighted5 = FHE.mul(encQ5, FHE.asEuint32(3));

        // Sum all weighted values to get stress index
        euint32 stressIndex = FHE.add(weighted1, weighted2);
        stressIndex = FHE.add(stressIndex, weighted3);
        stressIndex = FHE.add(stressIndex, weighted4);
        stressIndex = FHE.add(stressIndex, weighted5);

        // Track new participants
        if (!responses[msg.sender].exists) {
            participants.push(msg.sender);
        }

        // Store encrypted survey response
        responses[msg.sender] = SurveyResponse({
            q1_sleep_quality: encQ1,
            q2_stress_level: encQ2,
            q3_mood: encQ3,
            q4_anxiety: encQ4,
            q5_social_connection: encQ5,
            stressIndex: stressIndex,
            timestamp: block.timestamp,
            exists: true
        });

        // Grant decryption permissions to the user for all fields
        FHE.allow(encQ1, msg.sender);
        FHE.allow(encQ2, msg.sender);
        FHE.allow(encQ3, msg.sender);
        FHE.allow(encQ4, msg.sender);
        FHE.allow(encQ5, msg.sender);
        FHE.allow(stressIndex, msg.sender);

        // Allow contract to access encrypted data for future operations
        FHE.allowThis(encQ1);
        FHE.allowThis(encQ2);
        FHE.allowThis(encQ3);
        FHE.allowThis(encQ4);
        FHE.allowThis(encQ5);
        FHE.allowThis(stressIndex);

        emit SurveySubmitted(msg.sender, block.timestamp);
        emit StressIndexCalculated(msg.sender, block.timestamp);
    }

    /// @notice Get encrypted sleep quality response for the caller
    /// @return Encrypted sleep quality value
    function getSleepQuality() external view returns (euint32) {
        require(responses[msg.sender].exists, "No survey response found");
        return responses[msg.sender].q1_sleep_quality;
    }

    /// @notice Get encrypted stress level response for the caller
    /// @return Encrypted stress level value
    function getStressLevel() external view returns (euint32) {
        require(responses[msg.sender].exists, "No survey response found");
        return responses[msg.sender].q2_stress_level;
    }

    /// @notice Get encrypted mood response for the caller
    /// @return Encrypted mood value
    function getMood() external view returns (euint32) {
        require(responses[msg.sender].exists, "No survey response found");
        return responses[msg.sender].q3_mood;
    }

    /// @notice Get encrypted anxiety response for the caller
    /// @return Encrypted anxiety value
    function getAnxiety() external view returns (euint32) {
        require(responses[msg.sender].exists, "No survey response found");
        return responses[msg.sender].q4_anxiety;
    }

    /// @notice Get encrypted social connection response for the caller
    /// @return Encrypted social connection value
    function getSocialConnection() external view returns (euint32) {
        require(responses[msg.sender].exists, "No survey response found");
        return responses[msg.sender].q5_social_connection;
    }

    /// @notice Get encrypted stress index for the caller
    /// @return Encrypted stress index value
    function getStressIndex() external view returns (euint32) {
        require(responses[msg.sender].exists, "No survey response found");
        return responses[msg.sender].stressIndex;
    }

    /// @notice Get timestamp of last survey submission
    /// @return Timestamp value
    function getTimestamp() external view returns (uint256) {
        require(responses[msg.sender].exists, "No survey response found");
        return responses[msg.sender].timestamp;
    }

    /// @notice Check if user has submitted a survey
    /// @return True if user has submitted, false otherwise
    function hasSurveyResponse() external view returns (bool) {
        return responses[msg.sender].exists;
    }

    /// @notice Get total number of participants who have submitted surveys
    /// @return Total participant count
    function getTotalParticipants() external view returns (uint256) {
        return participants.length;
    }

    /// @notice Get participant address at specific index
    /// @param index Index in the participants array
    /// @return Participant address
    function getParticipantAtIndex(uint256 index) external view returns (address) {
        require(index < participants.length, "Index out of bounds");
        return participants[index];
    }

    /// @notice Get all encrypted responses for the caller
    /// @return q1 Sleep quality
    /// @return q2 Stress level
    /// @return q3 Mood
    /// @return q4 Anxiety
    /// @return q5 Social connection
    /// @return index Stress index
    /// @return time Timestamp
    function getAllResponses()
        external
        view
        returns (
            euint32 q1,
            euint32 q2,
            euint32 q3,
            euint32 q4,
            euint32 q5,
            euint32 index,
            uint256 time
        )
    {
        require(responses[msg.sender].exists, "No survey response found");
        SurveyResponse storage response = responses[msg.sender];
        return (
            response.q1_sleep_quality,
            response.q2_stress_level,
            response.q3_mood,
            response.q4_anxiety,
            response.q5_social_connection,
            response.stressIndex,
            response.timestamp
        );
    }
}

