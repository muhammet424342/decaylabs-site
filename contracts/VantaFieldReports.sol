// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Vanta Field Reports
/// @notice Free open-edition companion pieces for the Decay Labs archive.
///         One report is open at a time; each wallet may claim it once.
///         Mints are free — the claimer pays gas only.
contract VantaFieldReports is ERC1155, Ownable {
    using Strings for uint256;

    string public constant name = "Vanta Field Reports";
    string public constant symbol = "VFR";

    /// @notice Report id currently accepting claims.
    uint256 public activeReport;
    /// @notice Whether the active report accepts claims.
    bool public mintOpen;

    /// @notice Claims made per report id.
    mapping(uint256 => uint256) public totalMinted;
    /// @notice Whether a wallet already claimed a given report.
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    string private _baseUri;

    error MintClosed();
    error AlreadyClaimed();

    event ReportOpened(uint256 indexed reportId);
    event ReportClosed(uint256 indexed reportId);
    event BaseUriUpdated(string baseUri);

    constructor(address initialOwner, string memory baseUri_) ERC1155("") Ownable(initialOwner) {
        _baseUri = baseUri_;
        emit BaseUriUpdated(baseUri_);
    }

    /// @notice Claim the open report. Free, one per wallet per report.
    function mint() external {
        if (!mintOpen) revert MintClosed();
        uint256 reportId = activeReport;
        if (hasClaimed[reportId][msg.sender]) revert AlreadyClaimed();

        hasClaimed[reportId][msg.sender] = true;
        unchecked {
            totalMinted[reportId] += 1;
        }
        _mint(msg.sender, reportId, 1, "");
    }

    /// @notice Open a report for claiming. Closes whatever was open before.
    function openReport(uint256 reportId) external onlyOwner {
        activeReport = reportId;
        mintOpen = true;
        emit ReportOpened(reportId);
    }

    /// @notice Stop accepting claims for the active report.
    function closeReport() external onlyOwner {
        mintOpen = false;
        emit ReportClosed(activeReport);
    }

    function setBaseUri(string calldata baseUri_) external onlyOwner {
        _baseUri = baseUri_;
        emit BaseUriUpdated(baseUri_);
    }

    /// @dev Plain per-id JSON so the archive can serve static files.
    function uri(uint256 reportId) public view override returns (string memory) {
        return string.concat(_baseUri, reportId.toString(), ".json");
    }
}
