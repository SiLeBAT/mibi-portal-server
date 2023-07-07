
// tslint:disable-next-line: no-any
const heartBeat = async (request: any): Promise<any> => {
    const requestParams = request.params;
    const output = 'ping';
    // tslint:disable-next-line
    console.log(
        'My Test parameters received: ' + JSON.stringify(requestParams)
    );
    return output;
};
Parse.Cloud.define('heartBeat', heartBeat);


