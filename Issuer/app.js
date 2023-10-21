const express = require('express');
const axios = require('axios');
const { ArgumentParser } = require('argparse');
var qrcode = require('qrcode-terminal');
var QRCode = require("qrcode")

const app = express();
const port = 8080;

//action names
const CREATE_IDENTITY_ACTION = "createIdentity";
const GET_IDENTITY_ACTION = "getIdentity";
const CREATE_CLAIM_ACTION = "createClaim";
const GET_CLAIM_ACTION = "getClaim";
const GET_CLAIM_QR_ACTION = "getClaimQR";

const VehicleTypes = {
	Car: "Car",
	Truck: "Truck",
	Scooter: "Scooter",
	Motorcycle: "Motorcycle"
}

//issuer api info
const issuer_url = "https://fb80-164-92-170-18.ngrok-free.app/v1"
const username = "user-issuer"
const password = "password-issuer"

 
const parser = new ArgumentParser({
  description: 'Argparser for Issuer CLI'
});
parser.add_argument('-a', '--action', {help: "Action to be triggered"});
parser.add_argument('-v', '--vehicleType', {help: "Type of Vehicle. Can be one of the following: Car, Truck, Scooter, Motorcycle"});
parser.add_argument('-y', '--year', {help: "Year of Receipt of license. Must be higher than 1950"});
parser.add_argument('-i', '--identity', { help: 'Identity' });
parser.add_argument('-r', '--receiver', { help: 'Receiver' });
parser.add_argument('-c', '--claim', { help: 'Claim' });

parsed_args = parser.parse_args();
switch(parsed_args["action"]){
    case CREATE_IDENTITY_ACTION:
        createIdentity()
        break;
    case GET_IDENTITY_ACTION:
        getIdentity()
        break;
    case CREATE_CLAIM_ACTION:
        createClaim(VehicleTypes[parsed_args["vehicleType"].toString()], parsed_args["year"], parsed_args["identity"])
        break;
    case GET_CLAIM_ACTION:
        getClaim(parsed_args["identity"], parsed_args["claim"])
        break;
    case GET_CLAIM_QR_ACTION:
        getClaimQR(parsed_args["identity"], parsed_args["claim"])
        break;
}



//helper functions

function createIdentity(){
    console.log('Create identity request received');
    const url = `${issuer_url}/identities`

    rq = {
        "didMetadata":{
            "method": "polygonid",
            "blockchain":"polygon",
            "network": "mumbai"
        }
    }

    axios.post(url, rq, {auth: {username: username,password: password}})
      .then(function (response) {
        console.log(response["data"]);
      })
      .catch(function (error) {
        console.log(error);
      });
}

function getIdentity(){
    console.log('Get identity request received');
    const url = `${issuer_url}/identities`

    axios.get(url,{auth: {username: username,password: password}})
      .then(function (response) {
        console.log(response["data"]);
      })
      .catch(function (error) {
        console.log(error);
      });
}

function createClaim(vehicleType, yearOfReceipt, identity){
    if(! vehicleType || ! vehicleType || ! identity){
        console.error("Please provide type of vehicle 'typeOfVehicle' and year of 'receipt' and identity 'identity'")
        return
    }

    const url = `${issuer_url}/${identity}/claims`

    rq = {
        "credentialSchema":"https://ipfs.io/ipfs/Qmd6vPJnBfTwsgcnotwTnmphwKEsmoVzrNsmxcKxgGNWZd", // publicly hostet .json
        "type": "MasterWorkDriversLicense", // defined credential type in schema

        "credentialSubject": {
            "id": "did:polygonid:polygon:mumbai:2qEJURNEGK6wxJRk4Q1BGj5j5Rz1cTRp7EvEoPaVTr",
            "YearOfReceipt": parseInt(yearOfReceipt),
            "TypeOfVehicle": vehicleType
        },
    }
    axios.post(url, rq, {auth: {username: username,password: password}})
      .then(function (response) {
        console.log(response["data"]);
      })
      .catch(function (error) {
        console.log(error);
      });
}

function getClaim(identity, claim){
    if(! identity || ! claim){
        console.error("Please provide identity 'identity' and claim 'claim'")
        return
    }

    const url = `${issuer_url}/${identity}/claims/${claim}`

    axios.get(url, {auth: {username: username,password: password}})
      .then(function (response) {
        console.log(response["data"]);
      })
      .catch(function (error) {
        console.log(error);
      });
}

function createClaim(vehicleType, yearOfReceipt, identity){
    if(! vehicleType || ! vehicleType || ! identity){
        console.error("Please provide type of vehicle 'typeOfVehicle' and year of 'receipt' and identity 'identity'")
        return
    }

    const url = `${issuer_url}/${identity}/claims`

    rq = {
        "credentialSchema":"https://ipfs.io/ipfs/Qmd6vPJnBfTwsgcnotwTnmphwKEsmoVzrNsmxcKxgGNWZd", // publicly hostet .json
        "type": "MasterWorkDriversLicense", // defined credential type in schema

        "credentialSubject": {
            "id": "did:polygonid:polygon:mumbai:2qEJURNEGK6wxJRk4Q1BGj5j5Rz1cTRp7EvEoPaVTr",
            "YearOfReceipt": parseInt(yearOfReceipt),
            "TypeOfVehicle": vehicleType
        },
    }
    axios.post(url, rq, {auth: {username: username,password: password}})
      .then(function (response) {
        console.log(response["data"]);
      })
      .catch(function (error) {
        console.log(error);
      });
}

function getClaimQR(identity, claim){
    if(! identity || ! claim){
        console.error("Please provide identity 'identity' and claim 'claim'")
        return
    }

    const url = `${issuer_url}/${identity}/claims/${claim}/qrcode`


    axios.get(url, {auth: {username: username,password: password}})
      .then(function (response) {
        oldUrl = response["data"]["body"]["url"]
        response["data"]["body"]["url"] = issuer_url + oldUrl.substring(24)
        let requestAsString = JSON.stringify(response["data"])
        qrcode.generate(requestAsString, {small: true});
      })
      .catch(function (error) {
        console.log(error);
      });
}