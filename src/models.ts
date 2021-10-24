export type Article = {
  id: string;
  metadata: Metadata;
  highlights: Highlights[];
};

export type Metadata = {
  author: string;
  title: string;
  url: string;
  lastAccessedDate?: string;
};

export type Highlights = {
  id?: string;
  created: string;
  updated: string;
  text: string;
  incontext: string;
  user: string;
  annotation: string;
  tags: string[];
};

export type RenderTemplate = {
  is_new_article: boolean;
  title: string;
  author: string;
  url: string;
  highlights: {
    text: string;
    incontext?: string;
    createdOn?: string;
    updatedOn?: string;
    user?: string;
    annotation: string;
    tags: string[];
  }[];
};

export type SyncedFile = {
  filename: string,
  uri: string
}
