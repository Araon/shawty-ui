export interface ShortUrl {
  key: string;
  short_url: string;
  long_url: string;
  expire: Date;
  created_at: Date;
  expire_at: Date;
  clicks: number;
}

export interface Stats {
  clicks: number;
  created_at: Date;
  expire_at: Date;
}
