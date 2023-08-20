import { createDID, registerDID } from "@ayanworks/polygon-did-registrar";
import * as didResolvers from "did-resolver";
import * as didPolygon from '@ayanworks/polygon-did-resolver'


var network = "testnet";
var privateKey = "0x94ba9986d0c05d3a2757408b5d72a3f65674a2029db25006475b864e91575c01";

const txHash_createDID = await createDID(network, privateKey);
const txHash_registerDID = await registerDID(txHash_createDID.data.did, privateKey);
console.log(txHash_createDID)
console.log(txHash_registerDID)


const myResolver = new didResolvers.Resolver()
const resolvedDID = await myResolver.resolve("0xafC462F32407Fc4Cc7A11508d5A0e59421F9efe4")//.then(res => console.log(res))
console.log(resolvedDID)


const getMethods = (obj) => {
    let properties = new Set()
    let currentObj = obj
    do {
      Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof obj[item] === 'function')

}
