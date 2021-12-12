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
  group: string;
};

export type RenderTemplate = {
  is_new_article: boolean;
  title: string;
  author: string;
  url: string;
  highlights: {
    text: string;
    incontext?: string;
    created?: string;
    updated?: string;
    user?: string;
    annotation: string;
    tags: string[];
    group: string;
  }[];
};

export type Group = {
  id: string;
  name: string;
  type: string;
  public: boolean;
};

export type SyncedFile = {
  filename: string,
  uri: string
}
