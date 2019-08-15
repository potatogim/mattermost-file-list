
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {id as pluginId} from './manifest';

import {
    getCurrentChannelId,
} from 'mattermost-redux/selectors/entities/common';

import {OPEN_ROOT_MODAL, CLOSE_ROOT_MODAL, LOAD_FILES} from './action_types';
import { getLoadedFiles } from './selectors';
import { Client4 } from 'mattermost-redux/client';

export const getPluginServerRoute = (state) => {
    const config = getConfig(state);

    let basePath = '/';
    if (config && config.SiteURL) {
        basePath = new URL(config.SiteURL).pathname;

        if (basePath && basePath[basePath.length - 1] === '/') {
            basePath = basePath.substr(0, basePath.length - 1);
        }
    }

    return basePath + '/plugins/' + pluginId;
};

const simpleAction = (type) => () => (dispatch) => {
    dispatch({ type });
};

export const openRootModal = simpleAction(OPEN_ROOT_MODAL);
export const closeRootModal = simpleAction(CLOSE_ROOT_MODAL);

export const getCurrentChannelFiles = (pageRequest) => async (dispatch, getState) => {
    const state = getState();
    const baseUrl = getPluginServerRoute(state);
    const channelId = getCurrentChannelId(state);


    var urlParams = new URLSearchParams();
    if(pageRequest)
        Object.keys(pageRequest).forEach(k => urlParams.append(k, pageRequest[k]));

    const response = await fetch(baseUrl + "/files/channel/" + channelId + "?" + urlParams.toString());
    const responseObject = await response.json();

    dispatch({
        type: LOAD_FILES,
        payload: responseObject
    });
};

export const deleteFile = (file) => async (dispatch, getState) => {
    await Client4.deletePost(file.PostID);

    const state = getState();
    const currentFiles = getLoadedFiles(state);

    dispatch(getCurrentChannelFiles(currentFiles.Request));
};