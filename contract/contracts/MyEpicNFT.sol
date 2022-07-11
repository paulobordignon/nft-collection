// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import { Base64 } from "./libraries/Base64.sol";

contract MyEpicNFT is ERC721URIStorage {
   using Counters for Counters.Counter;
   Counters.Counter private _tokenIds;

   // svg base code
   string baseSvg =
      "<svg  xmlns='http://www.w3.org/2000/svg'  preserveAspectRatio='xMinYMin meet'  viewBox='0 0 350 350'>  <defs>    <linearGradient id='Gradient1'>      <stop class='stop1' offset='0%'/>      <stop class='stop2' offset='50%'/>      <stop class='stop3' offset='100%'/>    </linearGradient>  </defs>  <style>    .base {      fill: white;      font-family: serif;      font-size: 22px;      color: #FFF;    }    .stop1 { stop-color: black; }    .stop2 { stop-color: black; stop-opacity: 0; }    .stop3 { stop-color: black; }      </style>  <rect width='100%' height='100%' fill='url(#Gradient1)' />  <text    x='50%'    y='50%'    class='base'    dominant-baseline='middle'    text-anchor='middle'  >";

   // Three groups to export three random words to our nft
   string[] firstWords = ["GOD", "HE", "JUST", "CALM", "SHE", "IT"];
   string[] secondWords = ["IS", "HAS", "FAITH", "WAS", "WILL", "BEFORE"];
   string[] thirdWords = ["GOOD", "PLAN", "WAY", "DEAL", "DESIRE", "HOPE"];

   event NewEpicNFTMinted(address sender, uint256 tokenId, string finalTokenUri);

   constructor() ERC721("Incredible NFTs", "Incredible") {
      console.log("My NFT contract!");
   }

   function pickRandomFirstWord(uint256 tokenId)
      public
      view
      returns (string memory)
   {
      uint256 rand = random(
            string(
               abi.encodePacked("PRIMEIRA_PALAVRA", Strings.toString(tokenId))
            )
      );
      rand = rand % firstWords.length;
      return firstWords[rand];
   }

   function pickRandomSecondWord(uint256 tokenId)
      public
      view
      returns (string memory)
   {
      uint256 rand = random(
         string(
               abi.encodePacked("SEGUNDA_PALAVRA", Strings.toString(tokenId))
         )
      );
      rand = rand % secondWords.length;
      return secondWords[rand];
   }

   function pickRandomThirdWord(uint256 tokenId)
      public
      view
      returns (string memory)
   {
      uint256 rand = random(
         string(
            abi.encodePacked("TERCEIRA_PALAVRA", Strings.toString(tokenId))
         )
      );
      rand = rand % thirdWords.length;
      return thirdWords[rand];
    }

   function random(string memory input) internal pure returns (uint256) {
      return uint256(keccak256(abi.encodePacked(input)));
   }

   function makeAnEpicNFT() public {
      uint256 newItemId = _tokenIds.current();

      // Get the random words.
      string memory first = pickRandomFirstWord(newItemId);
      string memory second = pickRandomSecondWord(newItemId);
      string memory third = pickRandomThirdWord(newItemId);
      string memory combinedWord = string(
         abi.encodePacked(first, second, third)
      );

      // Final svg with words
      string memory finalSvg = string(
         abi.encodePacked(baseSvg, combinedWord, "</text></svg>")
      );

      // encode metadata json to base64.
      string memory json = Base64.encode(
         bytes(
            string(
               abi.encodePacked(
                  '{"name": "',
                  combinedWord,
                  '", "description": "A simple nft collection.", "image": "data:image/svg+xml;base64,',
                  // add data:image/svg+xml;base64 plus svg in base64.
                  Base64.encode(bytes(finalSvg)),
                  '"}'
               )
            )
         )
      );

      // as before add data:application/json;base64
      string memory finalTokenUri = string(
         abi.encodePacked("data:application/json;base64,", json)
      );

      console.log("\n--------------------");
      console.log(finalTokenUri);
      console.log("--------------------\n");

      _safeMint(msg.sender, newItemId);

      // Random URI!!!
      _setTokenURI(newItemId, finalTokenUri);

      _tokenIds.increment();
      console.log(
         "A NFT with ID %s was minted to %s",
         newItemId,
         msg.sender
      );

      emit NewEpicNFTMinted(msg.sender, newItemId, finalTokenUri);
   }
}
