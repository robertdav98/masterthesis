const express = require('express');
const {auth, resolver, protocol} = require('@iden3/js-iden3-auth')
const getRawBody = require('raw-body')
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const port = 8080;


app.use(express.static('public'));
app.use('/images', express.static('images'));


app.get("/api", (req, res) => {
    console.log('get Auth Request');
    GetAuthRequest(req,res);
});

app.post("/api/callback", (req, res) => {
    console.log('callback');
    Callback(req,res);
});

app.listen(port, () => {
    console.log('server running on port 8080');
});

// Create a map to store the auth requests and their session IDs
const requestMap = new Map();


async function GetAuthRequest(req,res) {

    // Audience is verifier id
    const hostUrl = "https://5d42-2a02-908-1990-98e0-987a-97bf-bf82-bcf6.ngrok-free.app"; // <- public ip
    const sessionId = 1;
    const callbackURL = "/api/callback"
    const audience = "did:polygonid:polygon:mumbai:2qEV3tagFATBNhavzsEpB5e98cAsPn7jKu13AhHtpU" // <- issuer did
    //const audience = "did:polygonid:polygon:mumbai:2qDyy1kEo2AYcP3RT4XGea7BtxsY285szg6yP9SPrs"


    const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;

    // Generate request for basic authentication
    const request = auth.createAuthorizationRequest(
        'Verify user has a drivers license',
        audience,
        uri
    );

    //request.id = '7f38a193-0918-4a48-9fac-36adfdb8b542';
    //request.thid = '7f38a193-0918-4a48-9fac-36adfdb8b542';
    
    request.id = '7f38a193-0918-4a48-9fac-36adfdb8b5423';
    request.thid = '7f38a193-0918-4a48-9fac-36adfdb8b5423';

    // Add request for a specific proof
    const proofRequest = {
      id: 1,
      circuitId: 'credentialAtomicQuerySigV2',
      query: {
        allowedIssuers: ['*'],
        type: 'DriversLicenseMasterThesis',
        context: 'https://ipfs.io/ipfs/Qmc7Yt5usPiRMUF2P83PkYVWtZHG8Lyp61UxmupZG2h7nS',
        credentialSubject: {
          yearOfReceipt: {
            $lt: 2000,
          },
        },
    },
    };
    const scope = request.body.scope ?? [];
    request.body.scope = [...scope, proofRequest];

  // Store auth request in map associated with session ID
    requestMap.set(`${sessionId}`, request);
    console.log(request)

    let requestAsString = JSON.stringify(request)
    let path = './public/qr.png'

    QRCode.toFile(path, requestAsString, {
      errorCorrectionLevel: 'H'
    }, function(err) {
      if (err) throw err;
      console.log('QR code saved!');
      res.redirect('/qr.png');
    });
}

async function Callback(req,res) {
    console.log("Called CallBack-Func")
    // Get session ID from request
    const sessionId = req.query.sessionId;

    // get JWZ token params from the post request
    const raw = await getRawBody(req);
    const tokenStr = raw.toString().trim();

    const ethURL = 'https://endpoints.omniatech.io/v1/matic/mumbai/public';
    const contractAddress = "0x134B1BE34911E39A8397ec6289782989729807a4"
    const keyDIR = "../keys"

    const ethStateResolver = new resolver.EthStateResolver(
        ethURL,
        contractAddress,
      );

    const resolvers = {
        ['polygon:mumbai']: ethStateResolver,
    };


    // fetch authRequest from sessionID
    const authRequest = requestMap.get(`${sessionId}`);

    // EXECUTE VERIFICATION
    let path_full = path.join(__dirname, './circuits-dir')
    console.log(path_full)
    const verifier = await auth.Verifier.newVerifier(
            {
            stateResolver: resolvers,
            circuitsDir: path_full
            //ipfsGatewayURL:"https://app.pinata.cloud/gateway/amethyst-official-duck-350?pinataGatewayToken=F5FDkLi66xtMWFQ0BCjZ1EGceaWSvbQ1uvkioaYqi9Iq4lSc8CRpMi-2EXVSa1f"
            }
    );


  try {
      const opts = {
          AcceptedStateTransitionDelay: 5 * 60 * 1000, // 5 minute
        };        
      authResponse = await verifier.fullVerify(tokenStr, authRequest, opts);
  } catch (error) {
  return res.status(500).send(error);
  }
  return res.status(200).set('Content-Type', 'application/json').send("user with ID: " + authResponse.from + " Succesfully authenticated");
}