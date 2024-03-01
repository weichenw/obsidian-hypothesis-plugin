export type Article = {
  id: string;
  metadata: Metadata;
  highlights: Highlights[];
  page_notes: Highlights[];
};

export type Metadata = {
  author: string;
  title: string;
  url: string;
  lastAccessedDate?: string;
};

export type Highlights = {
  id?: string;
  id_base62?: string;
  created: string;
  updated: string;
  text: string;
  incontext: string;
  user: string;
  annotation: string;
  tags: string[];
  group: string;
  isReply: boolean;
};

export type RenderTemplate = {
  is_new_article: boolean;
  title: string;
  author: string;
  url: string;
  highlights: Highlights[];
  page_notes: Highlights[];
};

export type Group = {
  id: string;
  name: string;
  type: string;
  public: boolean;
  selected: boolean;
};

export type SyncedFile = {
  filename: string,
  uri: string
}
