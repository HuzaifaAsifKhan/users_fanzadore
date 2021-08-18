import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import {
    getPosts,
    getPostsSuccess,
    getPostsFail,
    createPost,
    createPostSuccess,
    createPostFail
} from './actions';

const initialState = {
    posts: {
        requesting: false,
        error: null,
        success: false,
        items: [],
        total: 0
    },
    post: {
        requesting: false,
        error: null,
        success: false,
        data: null
    }
};

const postReducers = [
    {
        on: getPosts,
        reducer(state: any) {
            return {
                ...state,
                posts: {
                    ...state.posts,
                    requesting: true
                }
            };
        }
    },
    {
        on: getPostsSuccess,
        reducer(state: any, data: any) {
            return {
                ...state,
                posts: {
                    requesting: false,
                    items: data.payload,
                    total: data.payload.total,
                    success: true
                }
            };
        }
    },
    {
        on: getPostsFail,
        reducer(state: any, data: any) {
            return {
                ...state,
                posts: {
                    ...state.posts,
                    requesting: false,
                    error: data.payload
                }
            };
        }
    },
    {
        on: createPost,
        reducer(state: any) {
            return {
                ...state,
                post: {
                    ...state.post,
                    requesting: true,
                    error: null,
                    success: false
                }
            };
        }
    },
    {
        on: createPostSuccess,
        reducer(state: any, data: any) {
            return {
                ...state,
                post: {
                    requesting: false,
                    data: data,
                    error: null,
                    success: true
                },
                posts: {
                    total: state.posts.total + 1,
                    items: [data.payload, ...state.posts.items]
                }
            };
        }
    },
    {
        on: createPostFail,
        reducer(state: any, data: any) {
            return {
                ...state,
                post: {
                    ...state.post,
                    requesting: false,
                    error: data.payload,
                    success: false
                }
            };
        }
    }
]
export default merge({}, createReducers('post', [postReducers], initialState));