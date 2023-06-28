

const heartBeat = async (request: any): Promise<any> => {
    const requestParams = request.params;
    const output = 'ping';
    console.log(
        'My Test parameters received: ' + JSON.stringify(requestParams)
    );
    return output;
};
Parse.Cloud.define('heartBeat', heartBeat);


