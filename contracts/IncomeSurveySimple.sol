// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Simple Income Range Survey Contract (Non-FHE Version)
/// @author Secure Survey Vault
/// @notice Simplified version for networks without FHEVM support
contract IncomeSurveySimple {
    /// @notice Structure to store survey responses
    struct SurveyResponse {
        uint8 income_range; // Plain income range selection (1-3)
        uint256 timestamp; // Submission timestamp
        bool exists; // Flag to check if response exists
    }

    /// @notice Contract owner (deployer)
    address public owner;

    /// @notice Plain counters for each income range (no encryption)
    uint256 private range_1_count; // <$3k count
    uint256 private range_2_count; // $3–6k count
    uint256 private range_3_count; // >=$6k count

    /// @notice Mapping from user address to their survey responses
    mapping(address => SurveyResponse) private responses;

    /// @notice Array to track all users who have submitted surveys
    address[] private participants;

    /// @notice Total number of participants
    uint256 public totalParticipants;

    /// @notice Event emitted when a survey is submitted
    event SurveySubmitted(address indexed user, uint256 timestamp);

    /// @notice Event emitted when statistics are updated
    event StatisticsUpdated(uint256 timestamp);

    /// @notice Constructor sets the contract deployer as owner
    constructor() {
        owner = msg.sender;
    }

    /// @notice Submit income range selection
    /// @param _incomeRange Plain income range selection (1-3)
    /// @dev Income ranges: 1 = <$3k, 2 = $3–6k, 3 = >=$6k
    function submitSurvey(uint8 _incomeRange) external {
        // Validate input range (1-3)
        require(_incomeRange >= 1 && _incomeRange <= 3, "Invalid income range");

        // Update counters based on income range
        if (_incomeRange == 1) {
            range_1_count++;
        } else if (_incomeRange == 2) {
            range_2_count++;
        } else if (_incomeRange == 3) {
            range_3_count++;
        }

        // Track new participants
        if (!responses[msg.sender].exists) {
            participants.push(msg.sender);
            totalParticipants++;
        }

        // Store survey response
        responses[msg.sender] = SurveyResponse({
            income_range: _incomeRange,
            timestamp: block.timestamp,
            exists: true
        });

        emit SurveySubmitted(msg.sender, block.timestamp);
        emit StatisticsUpdated(block.timestamp);
    }

    /// @notice Get income range for the caller
    /// @return Plain income range value
    function getIncomeRange() external view returns (uint8) {
        require(responses[msg.sender].exists, "No survey response found");
        return responses[msg.sender].income_range;
    }

    /// @notice Get count for range 1 (<$3k)
    /// @return Plain count for range 1
    function getRange1Count() external view returns (uint256) {
        return range_1_count;
    }

    /// @notice Get count for range 2 ($3–6k)
    /// @return Plain count for range 2
    function getRange2Count() external view returns (uint256) {
        return range_2_count;
    }

    /// @notice Get count for range 3 (>=6k)
    /// @return Plain count for range 3
    function getRange3Count() external view returns (uint256) {
        return range_3_count;
    }

    /// @notice Get all statistics
    /// @return range1Count Plain count for <$3k
    /// @return range2Count Plain count for $3–6k
    /// @return range3Count Plain count for >=$6k
    function getAllStatistics()
        external
        view
        returns (
            uint256 range1Count,
            uint256 range2Count,
            uint256 range3Count
        )
    {
        return (range_1_count, range_2_count, range_3_count);
    }

    /// @notice Get submission timestamp for the caller
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

    /// @notice Get participant address at specific index
    /// @param index Index in the participants array
    /// @return Participant address
    function getParticipantAtIndex(uint256 index) external view returns (address) {
        require(index < participants.length, "Index out of bounds");
        return participants[index];
    }
}
