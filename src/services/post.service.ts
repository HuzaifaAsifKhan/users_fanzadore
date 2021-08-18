import { IPostSearch } from 'src/interfaces';
import { APIRequest } from './api-request';

export class PostService extends APIRequest {
  search(query: IPostSearch) {
    return this.get(this.buildUrl('/posts/search', query as any));
  }

  findById(id: string) {
    return this.get(`/posts/${id}`);
  }

  getPosts(performerId: string, userId: string) {
    return this.get(`/posts/performer/${performerId}/${userId}`);
  }
  
  public async createPost(documents: {
    file: File;
    fieldname: string;
  }[], data: any, onProgress?: Function) {
    return this.upload('/posts/create', documents, {
      onProgress,
      customData: data
    });
  }
}

export const postService = new PostService();
