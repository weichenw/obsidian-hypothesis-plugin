
import { settingsStore } from '~/store';
import ApiManager from '~/api/api';
import { Notice } from 'obsidian';

export class TokenManager {

    async setToken(token: string){
        if (token === null || token.length == 0) {
            await settingsStore.actions.disconnect;
            new Notice('Please enter API token to connect')
        } else{
            const apiManager = new ApiManager(token);
            const userid = await apiManager.getProfile();
            if (userid && userid !== undefined) {
                await settingsStore.actions.connect(token, userid);
            }
        }
    }
}