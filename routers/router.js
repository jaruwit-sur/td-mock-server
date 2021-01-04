import * as apiService from '../services/api-service';
import * as webhookService from '../services/webhook-service'
import * as transformService from '../services/transform-service'
import * as commond from '../utils/commond';

const apisUrl = '/apis';

export const routers = async (req, res, next) => {
    const { url, query, headers, method, body } = req;
    const apis = await apiService.finAll();
    switch (true) {
        case url === apisUrl && method.toLowerCase() === 'get':
            res.status(200).json(apis);
            return;
        case url === apisUrl && method.toLowerCase() === 'post':
            await apiService.save(req.body);
            res.status(201).json({ "message": "Successfully" });
            return;
        default:
            const urlAndMethodMatcher = await urlAndMethodMatching(apis, url, method);
            if (!urlAndMethodMatcher) {
                res.status(404).json();
                return;
            }
            await handleResponseByScenario(urlAndMethodMatcher, headers, query, body, res);
            return;
    }
};

const urlAndMethodMatching = async (apis, url, method) => {
    return await apis.filter(api => api.url === url && api.method.toLowerCase() === method.toLowerCase()).map(data => data)[0];
}

const handleResponseByScenario = async (urlAndMethodMatcher, headers, query, body, res) => {
    //todo find logic solution matchArgument
    const scenario = urlAndMethodMatcher.scenarios.filter(scenario => scenario.isEnable).map(data => data)[0];

    if (!scenario) {
        res.status(404).json();
        return;
    } else {
        console.log("hasMatchArguments : ", hasMatchArguments(headers, query, body, scenario.matchArgument));
        const { responseStatusCode, webHook } = scenario;
        const responseData = await mappingResponse(body, scenario);
        res.status(responseStatusCode).json(responseData);
        if (webHook.isEnable) {
            await webhookService.hook(body, webHook);
            return;
        }
    }
}

const hasMatchArguments = (reqHeaders, reqParams, reqBody, matchArgument) => {
    const { headers, parameters, payloads } = matchArgument;
    let hasMatchHeaders = hasMatchArgument(reqHeaders, headers, "headers");
    let hasMatchParameters = hasMatchArgument(reqParams, parameters, "parameters");
    let hasMatchPayloads = hasMatchArgument(reqBody, payloads, "payloads");
    console.log("hasMatchHeaders     : ", hasMatchHeaders);
    console.log("hasMatchParameters  : ", hasMatchParameters);
    console.log("hasMatchPayloads    : ", hasMatchPayloads);

    return hasMatchHeaders && hasMatchParameters && hasMatchPayloads;
}

const hasMatchArgument = (request, matchArgument, keyMatch) => {
    console.log("keyMatch       : ", keyMatch);
    console.log("request        : ", request);
    console.log("matchArgument  : ", matchArgument);
    console.log("...................................");
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
