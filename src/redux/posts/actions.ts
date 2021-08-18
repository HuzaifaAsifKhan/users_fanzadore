import { createAsyncAction } from '@lib/redux';

export const {
  getPosts,
  getPostsSuccess,
  getPostsFail
} = createAsyncAction('getPosts', 'GET_POSTS');

export const {
    createPost,
    createPostSuccess,
    createPostFail
  } = createAsyncAction('createPost', 'CREATE_POST');