// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');
const stepfunctions = new AWS.StepFunctions({region: 'us-east-1'});
const JOB_SUCCESS_MESSAGE = "Job Success!!";
const JOB_FAILURE_MESSAGE = "Job Failure!!";
let jobStatus;

(async function(){
    
    console.log("Business Logic Goes here!!");

    let taskToken = await getTaskToken();
    let repeater = setInterval(sendHeartBeat, 6000, taskToken);    
    setTimeout(async() => {
        clearInterval(repeater);  
        await sendTaskSuccess(taskToken);      
    }, 25000);
    
})();

function getTaskToken(){
    return new Promise((resolve, reject) => {
        let task_params = {
            activityArn: 'arn:aws:states:us-east-1:ACCOUNT_NUMBER:activity:Monitor_Job'
        };
        stepfunctions.getActivityTask(task_params, function(err, data) {
            if (err){
                console.log(err, err.stack); 
                reject(err);
            } 
            else{
                console.log("Response Data with Task Token ", data);           // successful response
                resolve(data.taskToken);
            }     
        });
    });
}

function sendHeartBeat(taskToken){

    return new Promise((resolve, reject) => {
        let heartbeat_params = {
            taskToken: String(taskToken)
        };
        stepfunctions.sendTaskHeartbeat(heartbeat_params, async function(err, data) {
            if (err){
                console.log(err, err.stack); // an error occurred
                reject(err);
            } 
            else{
                console.log("SENDING HEARTBEAT!!");
                console.log(data);           // successful response
                resolve(data);
            }     
        });
    });
}

function sendTaskSuccess(taskToken){
    console.log("Sending Job Success!! ");
    return new Promise((resolve, reject) => {
        let success_params = {
            output: JSON.stringify(JOB_SUCCESS_MESSAGE), 
            taskToken: taskToken
        };
        stepfunctions.sendTaskSuccess(success_params, function(err, data) {
            if (err){
                console.log(err, err.stack); // an error occurred
                reject(err)
            } 
            else{
                console.log(data);           // successful response
                resolve(data);
            }     
        });
    });
}

function sendTaskFailure(taskToken){
    console.log("Sending Job Failure!! ");
    return new Promise((resolve, reject) => {
        let failure_params = {
            taskToken: taskToken, 
            cause: JOB_FAILURE_MESSAGE
        };
        stepfunctions.sendTaskFailure(failure_params, function(err, data) {
            if (err){
                console.log(err, err.stack); // an error occurred
                reject(err)
            } 
            else{
                console.log(data);           // successful response
                resolve(data);
            }     
        });
    });
}