import axios from 'axios';
import * as transformService from '../services/transform-service'

export const hook = async (body, webhook) => {
    const { url, method, headers, data, isDataTransfrom, dataTransfrom } = webhook.configs;
    const requestData = await mappingData(body, data, isDataTransfrom, dataTransfrom);
    const configs = {
        url: url,
        method: method,
        headers: headers,
        data: requestData
    };
    
    await axios(configs)
        .then((response) => console.log(`hook to ${method.toUpperCase()} :: ${url} successfully`))
        .catch((error) => console.log(`hook to ${url} error `, error));
}

const mappingData = async (body, data, isDataTransfrom, dataTransfrom) => {
    if (isDataTransfrom) {
        return await transformService.transform(body, dataTransfrom);
    } else {
        return await data;
    }
}