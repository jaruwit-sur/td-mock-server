import * as apiService from '../services/api-service';
import * as webhookService from '../services/webhook-service'
import * as transformService from '../services/transform-service'
import * as commond from '../utils/commond';

const apisUrl = '/apis';

export const routers = async (req, res, next) => {
    const { _parsedUrl: { pathname }, query, headers, method, body } = req;
    // console.log("pathname  : ", pathname);
    // console.log("query     : ", query);
    // console.log("headers   : ", headers);
    // console.log("method    : ", method);
    // console.log("body      : ", body);
    // console.log("--------------------------");
    const apis = await apiService.finAll();
    switch (true) {
        case pathname === apisUrl && method.toLowerCase() === 'get':
            res.status(200).json(apis);
            return;
        case pathname === apisUrl && method.toLowerCase() === 'post':
            await apiService.save(req.body);
            res.status(201).json({ "message": "Successfully" });
            return;
        default:
            const urlAndMethodMatcher = await urlAndMethodMatching(apis, pathname, method);
            if (!urlAndMethodMatcher) {
                res.status(404).json();
                return;
            }
            await handleResponseByScenario(urlAndMethodMatcher, headers, query, body, res);
            return;
    }
};

const urlAndMethodMatching = async (apis, pathname, method) => {
    return await apis.find(api => api.url === pathname && api.method.toLowerCase() === method.toLowerCase());
}

const handleResponseByScenario = async (urlAndMethodMatcher, headers, query, body, res) => {
    const { scenarios } = urlAndMethodMatcher;
    const scenario = scenarios.find(scenario => hasMatchArguments(headers, query, body, scenario.matchArgument));

    if (!scenario) {
        res.status(404).json();
        return;
    }
     
    const { responseStatusCode, webHook } = scenario;
    const responseData = await mappingResponse(body, scenario);
    res.status(responseStatusCode).json(responseData);
    if (webHook.isEnable) {
        await webhookService.hook(body, webHook);
        return;
    }
}

const hasMatchArguments = (reqHeaders, reqParams, reqBody, matchArgument) => {
    const { headers, parameters, payloads } = matchArgument;
    let hasMatchHeaders = hasMatchArgument(reqHeaders, headers);
    let hasMatchParameters = hasMatchArgument(reqParams, parameters);
    let hasMatchPayloads = hasMatchArgument(reqBody, payloads);
    //console.log("hasMatchHeaders     : ", hasMatchHeaders);
    //console.log("hasMatchParameters  : ", hasMatchParameters);
    //console.log("hasMatchPayloads    : ", hasMatchPayloads);
    return hasMatchHeaders && hasMatchParameters && hasMatchPayloads;
}

const hasMatchArgument = (request, matchArgument) => {
    //console.log("request        : ", request);
    //console.log("matchArgument  : ", matchArgument);
    //console.log("...................................");
    const matchArgumentLength = matchArgument.length;
    if (matchArgumentLength) {
        return matchArgumentLength === matchArgument.filter(o => commond.matchArgument(request, o)).length;
    } else {
        return true;
    }
}

const mappingResponse = async (data, scenarioResponse) => {
    const { response, isResponseTransfrom, responseTransfrom } = scenarioResponse;
    if (isResponseTransfrom) {
        return await transformService.transform(data, responseTransfrom);
    } else {
        return response;
    }
}
