import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { postService } from '@services/index';
import { IReduxAction, IPostCreate } from 'src/interfaces';
import { message } from 'antd';
import * as _ from 'lodash';
import Router from 'next/router';
import {
    getPosts,
    getPostsSuccess,
    getPostsFail,
    createPost,
    createPostSuccess,
    createPostFail
} from './actions';

const postSagas = [
    {
        on: getPosts,
        * worker(data: IReduxAction<any>) {
          try { 
            const resp = yield postService.getPosts(data.payload.performerId, data.payload.userId);
            console.log("getPosts resp.data", resp.data)
            yield put(getPostsSuccess(resp.data));
          } catch (e) {
            const error = yield Promise.resolve(e);
            yield put(getPostsFail(error));
          }
        }
      },
      {
        on: createPost,
        * worker(data: IReduxAction<any>) {
          try {
            const file = [{
              fieldname: 'file',
              file: data.payload.file.originFileObj
            }];
            const payload = _.pick(data.payload, ['content', 'author', 'scheduleDateTime', 'expiryTime', 'postPrice', 'authorId', 'optionOne', 'optionTwo', 'optionThree', 'isPoll']) as IPostCreate;
            const resp = (yield postService.createPost(file, payload, () => {
              }));
            yield put(createPostSuccess(resp.data, null));
            yield message.success('Thanks for the post');
            Router.push(`/model/${localStorage.getItem('username')}`);
          } catch (e) {console.log('e: ', e)
            const error = yield Promise.resolve(e);
            yield message.error('Error occured, please try again later createPost');
            yield put(createPostFail(error)); 
          }
        }
      }
]
export default flatten([createSagas(postSagas)]);