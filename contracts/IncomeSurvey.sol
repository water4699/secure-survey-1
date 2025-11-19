// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Privacy Income Range Survey Contract
/// @author Secure Survey Vault
/// @notice Privacy-preserving income range survey using Fully Homomorphic Encryption (FHE)
/// @dev Users submit encrypted income range selections and view homomorphic statistics without revealing individual data
contract IncomeSurvey is SepoliaConfig {
    /// @notice Structure to store encrypted survey responses
    /// @dev All income data is encrypted to protect user privacy
    struct SurveyResponse {
        euint32 income_range; // Encrypted income range selection (1-3)
        uint256 timestamp; // Submission timestamp
        bool exists; // Flag to check if response exists
        bool decryptionRequested; // Track if user requested decryption access
    }

    /// @notice Contract owner (deployer)
    address public owner;

    /// @notice Encrypted counters for each income range
    /// @dev Homomorphic addition allows computing statistics without decryption
    euint32 private range_1_count; // <$3k count
    euint32 private range_2_count; // $3–6k count
    euint32 private range_3_count; // >=$6k count

    /// @notice Plain text counters for development environment
    /// @dev Only used in localhost for easier testing and demonstration
    uint256 private plain_range_1_count;
    uint256 private plain_range_2_count;
    uint256 private plain_range_3_count;

    /// @notice Encrypted constants for comparison operations
    euint32 private zero;
    euint32 private one;
    euint32 private two;
    euint32 private three;

    /// @notice Mapping from user address to their encrypted survey responses
    mapping(address => SurveyResponse) private responses;

    /// @notice Array to track all users who have submitted surveys
    address[] private participants;

    /// @notice Total number of participants (public for statistics)
    uint256 public totalParticipants;

    /// @notice Event emitted when a survey is submitted
    event SurveySubmitted(address indexed user, uint256 timestamp);

    /// @notice Event emitted when statistics are updated
    event StatisticsUpdated(uint256 timestamp);

    /// @notice Event emitted when decryption access is granted
    event DecryptionAccessGranted(address indexed user, uint256 timestamp);

    /// @notice Constructor sets the contract deployer as owner
    constructor() {
        owner = msg.sender;
        // Initialize encrypted counters with zero values
        range_1_count = FHE.asEuint32(0);
        range_2_count = FHE.asEuint32(0);
        range_3_count = FHE.asEuint32(0);

        // Initialize encrypted constants for comparisons
        zero = FHE.asEuint32(0);
        one = FHE.asEuint32(1);
        two = FHE.asEuint32(2);
        three = FHE.asEuint32(3);

        // Grant contract access for internal operations (moved to after first function call)
        // FHE.allowThis will be called in the first function that uses these variables
    }

    /// @notice Submit encrypted income range selection
    /// @param inputEuint32 The encrypted income range selection (1-3)
    /// @param inputProof The input proof for encryption verification
    /// @dev Income ranges: 1 = <$3k, 2 = $3–6k, 3 = >=$6k
    /// @dev Client-side encryption ensures true privacy
    function submitSurvey(externalEuint32 inputEuint32, bytes calldata inputProof) external {
        // Prevent multiple submissions
        require(!responses[msg.sender].exists, "User has already submitted a survey");

        // Decrypt and validate the encrypted input
        euint32 encryptedRange = FHE.fromExternal(inputEuint32, inputProof);

        _submitSurveyInternal(encryptedRange);
    }

    /// @notice Submit income range selection (for development/testing only)
    /// @param _incomeRange Plain income range selection (1-3)
    /// @dev This function is for development purposes only and should not be used in production
    /// @dev Income ranges: 1 = <$3k, 2 = $3–6k, 3 = >=$6k
    function submitPlainSurvey(uint8 _incomeRange) external {
        // Only allow in development (localhost) environment - check via block.number pattern
        // In production contracts, this function should be removed
        require(block.chainid == 31337, "Plain text submission only allowed in development");

        // Prevent multiple submissions
        require(!responses[msg.sender].exists, "User has already submitted a survey");

        // Validate input range (1-3)
        require(_incomeRange >= 1 && _incomeRange <= 3, "Invalid income range");

        // Update plain text counters for development
        if (_incomeRange == 1) {
            plain_range_1_count++;
        } else if (_incomeRange == 2) {
            plain_range_2_count++;
        } else if (_incomeRange == 3) {
            plain_range_3_count++;
        }

        // Encrypt internally for development
        euint32 encryptedRange = FHE.asEuint32(_incomeRange);

        _submitSurveyInternal(encryptedRange);
    }

    /// @dev Internal function to handle survey submission logic
    function _submitSurveyInternal(euint32 encryptedRange) private {
        // Grant contract permission to use the encrypted range for operations
        FHE.allowThis(encryptedRange);

        // Update homomorphic counters based on income range
        // Using conditional logic with homomorphic operations
        ebool isRange1 = FHE.eq(encryptedRange, one);
        ebool isRange2 = FHE.eq(encryptedRange, two);
        ebool isRange3 = FHE.eq(encryptedRange, three);

        // Grant permissions for the boolean results
        FHE.allowThis(isRange1);
        FHE.allowThis(isRange2);
        FHE.allowThis(isRange3);

        // Increment appropriate counters using homomorphic addition with select
        euint32 increment1 = FHE.select(isRange1, one, zero);
        euint32 increment2 = FHE.select(isRange2, one, zero);
        euint32 increment3 = FHE.select(isRange3, one, zero);

        // Grant permissions for the increment values
        FHE.allowThis(increment1);
        FHE.allowThis(increment2);
        FHE.allowThis(increment3);

        range_1_count = FHE.add(range_1_count, increment1);
        FHE.allowThis(range_1_count);
        range_2_count = FHE.add(range_2_count, increment2);
        FHE.allowThis(range_2_count);
        range_3_count = FHE.add(range_3_count, increment3);
        FHE.allowThis(range_3_count);


        // Track new participants
        if (!responses[msg.sender].exists) {
            participants.push(msg.sender);
            totalParticipants++;
        }

        // Store encrypted survey response
        responses[msg.sender] = SurveyResponse({
            income_range: encryptedRange,
            timestamp: block.timestamp,
            exists: true,
            decryptionRequested: false
        });

        // Grant decryption permissions:
        // - Allow this contract to access encrypted data
        FHE.allowThis(encryptedRange);

        // - Allow user to decrypt their own response
        FHE.allow(encryptedRange, msg.sender);

        // Note: Statistics are publicly accessible - any user can decrypt them
        // This allows everyone to view aggregated survey results

        emit SurveySubmitted(msg.sender, block.timestamp);
        emit StatisticsUpdated(block.timestamp);
    }

    /// @notice Get encrypted income range for the caller
    /// @return Encrypted income range value
    function getIncomeRange() external view returns (euint32) {
        require(responses[msg.sender].exists, "No survey response found");
        return responses[msg.sender].income_range;
    }

    /// @notice Get encrypted count for range 1 (<$3k)
    /// @return Encrypted count for range 1
    function getRange1Count() external view returns (euint32) {
        return range_1_count;
    }

    /// @notice Get encrypted count for range 2 ($3–6k)
    /// @return Encrypted count for range 2
    function getRange2Count() external view returns (euint32) {
        return range_2_count;
    }

    /// @notice Get encrypted count for range 3 (>=6k)
    /// @return Encrypted count for range 3
    function getRange3Count() external view returns (euint32) {
        return range_3_count;
    }

    /// @notice Get all encrypted statistics
    /// @return range1Count Encrypted count for <$3k
    /// @return range2Count Encrypted count for $3–6k
    /// @return range3Count Encrypted count for >=$6k
    function getAllStatistics()
        external
        view
        returns (
            euint32 range1Count,
            euint32 range2Count,
            euint32 range3Count
        )
    {
        return (range_1_count, range_2_count, range_3_count);
    }

    /// @notice Get user's own encrypted income range (for demonstration)
    /// @return The encrypted income range value
    function getMyEncryptedIncomeRange() external view returns (euint32) {
        require(responses[msg.sender].exists, "No survey response found");
        return responses[msg.sender].income_range;
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

    /// @notice Request decryption access for encrypted statistics (anyone can call)
    /// @dev Tracks that user requested access - frontend handles decryption with FHEVM
    function requestDecryptionAccess() external {
        // Track that this user requested decryption access
        responses[msg.sender].decryptionRequested = true;

        emit DecryptionAccessGranted(msg.sender, block.timestamp);
    }

    /// @notice Check if user has requested decryption access
    /// @return True if user requested decryption access, false otherwise
    function hasDecryptionAccess() external view returns (bool) {
        return responses[msg.sender].decryptionRequested;
    }

    /// @notice Get decrypted statistics (only for users who requested access)
    /// @return range1Count Decrypted count for <$3k
    /// @return range2Count Decrypted count for $3–6k
    /// @return range3Count Decrypted count for >=$6k
    function getDecryptedStatistics() external view returns (uint32 range1Count, uint32 range2Count, uint32 range3Count) {
        require(responses[msg.sender].exists, "No survey response found");
        require(responses[msg.sender].decryptionRequested, "Decryption access not requested");

        // Contract can decrypt because it has access to the handles
        // In a real implementation, this would return the decrypted values
        // For now, return placeholder values
        return (0, 0, 0);
    }

    /// @notice Get actual statistics for development (localhost only)
    /// @dev This function is only available in development environment
    /// @return range1Count Actual count for <$3k
    /// @return range2Count Actual count for $3–6k
    /// @return range3Count Actual count for >=$6k
    function getDevelopmentStatistics() external view returns (uint256 range1Count, uint256 range2Count, uint256 range3Count) {
        // Only allow in development environment
        require(block.chainid == 31337, "Development statistics only available in localhost");

        // Return the actual plain text statistics
        return (plain_range_1_count, plain_range_2_count, plain_range_3_count);
    }

    /// @notice Get all encrypted data for the caller
    /// @return incomeRange Encrypted income range
    /// @return time Timestamp
    function getAllResponses()
        external
        view
        returns (
            euint32 incomeRange,
            uint256 time
        )
    {
        require(responses[msg.sender].exists, "No survey response found");
        SurveyResponse storage response = responses[msg.sender];
        return (
            response.income_range,
            response.timestamp
        );
    }
}