
import { Notice, moment } from 'obsidian';

export default class ApiManager {
  readonly baseUrl: string = 'https://hypothes.is/api';
  private token: string;
  private userid: string;

  constructor(token: string, userid: string = undefined) {
    this.token = token;
    this.userid = userid;
  }

  private getHeaders() {
    return {
      'AUTHORIZATION': `Bearer ${this.token}`,
      'Accept': 'application/json',
    };
  }

  async getProfile() {
    let response;
    let data;

    try {
      response = await fetch(`${this.baseUrl}/profile`, { headers: { ...this.getHeaders() } })
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

  async getHighlights(lastSyncDate?: Date) {
    // let offset = 0;
    let maxResult = 1000;
    let initialQuery = true;
    let result = [];
    let response;

    const queryDate = lastSyncDate ? `&search_after=${moment.utc(lastSyncDate).format()}` : '';
    // const limit = lastSyncDate ? 200 : 100;
    const limit = 200;

    for (let resultCount = 0; resultCount < maxResult;) {

      try {
        response = await fetch(`${this.baseUrl}/search?user=${this.userid}&offset=${resultCount}&limit=${limit}&sort=updated&order=asc` + queryDate, { headers: { ...this.getHeaders() } })
      }
      catch (e) {
        new Notice('Error occurs. Please check your API token and try again.')
        console.log("Failed to fetch highlights : ", e);
        return;
      }

      if (response && response.ok) {
        const data = await response.json();

        if (!data.rows.length) {
          break;
        }

        //initial run to set total
        if (initialQuery) {
          if (data.total <= maxResult) {
            //overwrite total
            maxResult = data.total;
            //no longer inital query to find total
            initialQuery = !initialQuery;
          }
        }

        resultCount += data.rows.length;
        result = [...result, ...data.rows];

        //break loop. pagination doesnt work with search_after param
        if (lastSyncDate) {
          break;
        }

      } else {
        new Notice('Sync failed. Please check your API token and try again.')
        console.log("Failed to fetch highlights : ", response);
        return;
      }


    }
    return result;
  }

  async getHighlightWithUri(uri: string) {

    let result = [];
    let response;
    const limit = 200;

    try {
      response = await fetch(`${this.baseUrl}/search?user=${this.userid}&limit=${limit}&uri=${uri}&sort=updated&order=asc`, { headers: { ...this.getHeaders() } })
    }
    catch (e) {
      new Notice('Error occurs. Please check your API token and try again.')
      console.log("Failed to fetch highlights : ", e);
      return;
    }

    if (response && response.ok) {
      const data = await response.json();

      result = data.rows;

    } else {
      new Notice('Sync failed. Please check your API token and try again.')
      console.log("Failed to fetch highlights : ", response);
      return;
    }

    return result;

  }

  async getGroups() {
    let result = [];
    let response;

    try {
      response = await fetch(`${this.baseUrl}/groups`, { headers: { ...this.getHeaders() } })
    }
    catch (e) {
      new Notice('Error occurs. Please check your API token and try again.')
      console.log("Failed to fetch groups : ", e);
      return;
    }

    if (response && response.ok) {
      const data = await response.json();

      result = data;

    } else {
      new Notice('Sync failed. Please check your API token and try again.')
      console.log("Failed to fetch groups : ", response);
      return;
    }

    return result;
  }

}
