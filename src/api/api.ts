
import {BASEURL} from './baseUrl';
import { Notice, moment } from 'obsidian';

export default class ApiManager {

   private token: string;
   private userid: string;

  constructor(token: string, userid: string = undefined){
    this.token = token;
    this.userid = userid;
  }

   private getHeaders(){
    return {
      'AUTHORIZATION': `Bearer ${this.token}`,
      'Accept': 'application/json',
    };
  }

   async getProfile(){
        let response;
        let data;

        try{
            response = await fetch(`${BASEURL}/profile`, {headers: {...this.getHeaders()}})
        }
        catch (e) {
            new Notice('Authorization failed. Please check your API token and try again.')
            console.error("Failed to fetch profile : ", e);
            return;
        }

        if (response && response.ok) {
         data = await response.json();
        } else {
          new Notice('Authorization failed. Please check your API token and try again.')
          console.error("Failed to fetch profile : ", response);
          return;
        }

        if (data.userid) {
          return data.userid;
        } else {
          //user not found
          new Notice('User not found. Please check your API token and try again.')
        }
  }

  async getHighlights(lastSyncDate?: Date){
        let response;
        let data;

        const queryDate = lastSyncDate ? `&search_after=${moment.utc(lastSyncDate).format()}` : '';

        try{
            response = await fetch(`${BASEURL}/search?user=${this.userid}&limit=100&sort=created&order=asc`+queryDate, {headers: {...this.getHeaders()}})
        }
        catch (e) {
            new Notice('Error occurs. Please check your API token and try again.')
            console.log("Failed to fetch highlights : ", e);
            return;
        }

         if (response && response.ok) {
          data = await response.json();

        } else {
          new Notice('Sync failed. Please check your API token and try again.')
          console.log("Failed to fetch highlights : ", response);
          return;
        }

        return data.rows;
  }
}