
import { Notice, moment } from 'obsidian';
import axios from "axios";

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
    try {
      const response = await axios.get(`${this.baseUrl}/profile`, { headers: this.getHeaders() })
      return response.data.userId
    }
    catch (e) {
      new Notice('Failed to authorize Hypothes.is user. Please check your API token and try again.')
      console.error(e);
      return;
    }
  }

  async getHighlights(lastSyncDate?: Date, limit = 2000) {
    let annotations = [];

    try {
      // Paginate API calls via search_after param
      // search_after=null starts at with the earliest annotations
      let newestTimestamp = lastSyncDate && moment.utc(lastSyncDate).format()
      while (annotations.length < limit) {
        const response = await axios.get(
          `${this.baseUrl}/search`,
          {
            params: {
              limit: 200, // Max pagination size
              sort: "updated",
              order: "asc", // Get all annotations since search_after
              search_after: newestTimestamp,
              user: this.userid,
            },
            headers: this.getHeaders()
          }
        )
        const newAnnotations = response.data.rows;
        if (!newAnnotations.length) {
          // No more annotations
          break;
        }

        annotations = [ ...annotations, ...newAnnotations ];
        newestTimestamp = newAnnotations[newAnnotations.length - 1].updated;
      }

    } catch (e) {
      new Notice('Failed to fetch Hypothes.is annotations. Please check your API token and try again.')
      console.error(e);
    }

    return annotations;
  }

  async getHighlightWithUri(uri: string, limit = 200) {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          limit, 
          uri,
          user: this.userid,
          sort: "updated",
          order: "asc"
        },
        headers: this.getHeaders()
      })
    
      return response.data.rows;
    } catch (e) {
      new Notice('Failed to fetch Hypothes.is annotations. Please check your API token and try again.')
      console.error(e);
    }
  }

  async getGroups() {
    try {
      const response = await axios.get(`${this.baseUrl}/groups`, { headers: this.getHeaders() })
      return response.data
    } catch (e) {
      new Notice('Failed to fetch Hypothes.is annotation groups. Please check your API token and try again.')
      console.error(e);
    }
  }
}
