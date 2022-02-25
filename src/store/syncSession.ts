import { writable } from 'svelte/store';
import { settingsStore } from '~/store';
import type { Article } from '~/models';

type SyncJob = {
  status: 'idle' | 'in-progress' | 'done' | 'error';
  articleId: string;
};

type SyncResult = {
  newArticlesCount: number;
  newHighlightsCount: number;
  updatedArticlesCount: number;
  updatedHighlightsCount: number;
};

type SyncSession = {
  status: 'idle' | 'login' | 'loading' | 'error';
  errorMessage?: string;
  jobs: SyncJob[];
};

// const getArticles = (state: SyncSession): Article[] => {
//   return state.jobs.map((j) => j.article);
// };

const createSyncSessionStore = () => {
  const initialState: SyncSession = {
    status: 'idle',
    jobs: [],
  };

  const store = writable(initialState);

  const startSync = () => {
    store.update((state) => {
      state.status = 'loading';
      state.errorMessage = undefined;
      state.jobs = [];
      return state;
    });
  };

  const reset = () => {
    store.update((state) => {
      state.status = 'idle';
      state.errorMessage = undefined;
      state.jobs = [];
      return state;
    });
  };

  const errorSync = (errorMessage: string) => {
    store.update((state) => {
      state.status = 'error';
      state.errorMessage = errorMessage;
      return state;
    });
  };

  const completeSync = (result: SyncResult) => {
    store.update((state) => {
      settingsStore.actions.setSyncDateToNow();
      settingsStore.actions.incrementHistory({
        totalArticles: result.newArticlesCount,
        totalHighlights: result.newHighlightsCount,
      });
      reset();
      return state;
    });
  };

  const setJobs = (articles: Article[]) => {
    store.update((state) => {
      for (const article of articles) {
        state.jobs.push({ status: 'idle', articleId: article.id });
      }
      return state;
    });
  };

  const updateJob = (article: Article, status: SyncJob['status']) => {
    store.update((state) => {
      const job = state.jobs.filter((job) => job.articleId === article.id)[0];
      job.status = status;

      if (status === 'done') {
        settingsStore.actions.setSyncDateToNow();
      }

      return state;
    });
  };

  return {
    subscribe: store.subscribe,
    actions: {
      startSync,
      errorSync,
      completeSync,
      setJobs,
      startJob: (article: Article) => updateJob(article, 'in-progress'),
      completeJob: (article: Article) => updateJob(article, 'done'),
      errorJob: (article: Article) => updateJob(article, 'error'),
      reset,
    },
  };
};

export const syncSessionStore = createSyncSessionStore();
