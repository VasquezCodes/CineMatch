export type ImportQueueStatus = 'pending' | 'processing' | 'completed' | 'error';

export type ImportQueueItem = {
  id: string;
  user_id: string;
  status: ImportQueueStatus;
  payload: any;
  created_at: string;
  updated_at: string;
};

