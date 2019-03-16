import _ from 'lodash';
import AWS from 'aws-sdk';

const createErrorFormat = (errorMessage, errorCode) => {
    var jsonData = {};
    jsonData["id"] = errorCode;
    jsonData["text"] = errorMessage;
    return jsonData;
};

const done = (err, res) => callback(null, {
    "body" : err ? err.message : res.body,
    "statusCode" : err ? err.status : res.status,
    "headers" : {
        'Content-Type' : 'application/json',
        'Accept' : 'application/json',
        'X-Requested-With' : '*',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods' : 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers' : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with'
    }
});

let dynamodb;

export function handler(event, context, callback) {
    if (dynamodb === undefined) {
        console.log("DB connection created for region " +  process.env.AWS_DEFAULT_REGION);
        dynamodb = new AWS.DynamoDB.DocumentClient();
    }
    executeRequest(event, done)
}

async function executeRequest(event, done) {
    switch (event.method) {
        case 'POST' :
            try {
                persistUserProfileData(event, done);
            } catch (err) {
                done(err);
                break;
            }
            break;
        case 'GET' :
            try {
                getUserProfileData(userAccountId, done);
            } catch (err) {
                done(err);
                break;
            }    
            break;
        default:
            let err = new Error();
            err.message = createErrorFormat("Method not supported", "10405"); 
            err.status = 405;
            done(err);
    }
}

function getUserProfileData (userAccountId, done) {
    const getProfileForUserAccount = {
        TableName: "cma_user_profile",
        ProjectionExpression: "username, date_of_birth, gender, profile_picture",
        KeyConditionExpression: "#userAccountId = :userAccountId",
        ExpressionAttributeNames: {
            ":userAccountId" : userAccountId
        }
    }
    const response = {
        status: 200,
        body: JSON.stringify({ username: 'ashwini', date_of_birth: '01/01/1990', gender: 'male', profile_picture: 'https://clo-app.com' })
    };
    done(null, response);
}

function persistUserProfileData (event, done) {
    const response = {
        status: 204,
    };
    done(null, response);
}
