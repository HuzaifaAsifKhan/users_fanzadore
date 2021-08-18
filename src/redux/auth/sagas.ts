import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import Router from 'next/router';
import { authService, userService, performerService } from 'src/services';
import {
  ILogin, IFanRegister, IForgot, IPerformerRegister
} from 'src/interfaces';
import { message } from 'antd';
import * as _ from 'lodash';
import { updateCurrentUser, resetUser } from '../user/actions';
import {
  login,
  loginSuccess,
  logout,
  loginFail,
  registerFanFail,
  registerFan,
  registerFanSuccess,
  registerPerformerFail,
  registerPerformer,
  registerPerformerSuccess,
  loginPerformer,
  forgot,
  forgotSuccess,
  forgotFail,
  resetAuth
} from './actions';

const authSagas = [
  {
    on: login,
    * worker(data: any) {
      try {
        const payload = data.payload as ILogin;
        const resp = (yield authService.login(payload)).data;
        // store token, update store and redirect to dashboard page
        yield authService.setToken(resp.token, 'user');
        const userResp = (yield userService.me()).data;
        yield put(updateCurrentUser(userResp));
        yield put(loginSuccess());
        Router.push('/home');
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(
          // eslint-disable-next-line no-nested-ternary
          (error && error.message)
            ? (error.message === 'EMAIL_NOT_VERIFIED' ? 'Please verify your email.' : error.message)
            : 'Incorrect credentials!'
        );
        yield put(loginFail(error));
      }
    }
  },

  {
    on: loginPerformer,
    * worker(data: any) {
      try {
        const payload = data.payload as ILogin;
        const resp = (yield authService.loginPerformer(payload)).data;
        // store token, update store and redirect to dashboard page
        yield authService.setToken(resp.token, 'performer');
        const userResp = (yield performerService.me()).data;
        yield put(updateCurrentUser(userResp));
        yield put(loginSuccess());
        if(payload.loginAs === 'newPerformer')
        {
          Router.push('/model/account')
        }
        else {
        Router.push({ pathname: '/model/profile', query: { username: userResp.username } }, `/model/${userResp.username}`);
        }
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error((error && error.message ? error.message : 'Incorrect credentials!'), 5);
        yield put(loginFail(error));
      }
    }
  },

  {
    on: registerFan,
    * worker(data: any) {
      try {
        const payload = data.payload as IFanRegister;
        const resp = (yield authService.register(payload)).data;
        message.success(resp && resp.message, 5);
        Router.push('/auth/login');
        yield put(registerFanSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error.message || 'Username or email has been taken.');
        yield put(registerFanFail(error));
      }
    }
  },

  {
    on: registerPerformer,
    * worker(data: any) {
      try {
        const verificationFiles = [{
          fieldname: 'idVerification',
          file: data.payload.idVerificationFile
        }, {
          fieldname: 'documentVerification',
          file: data.payload.documentVerificationFile
        }];
        const payload = _.pick(data.payload, ['name', 'username', 'password', 'gender', 'email', 'firstName', 'lastName', 'country']) as IPerformerRegister;
        const resp = (yield authService.registerPerformer(verificationFiles, payload, () => {
        // put progressing to view
        })).data;
        message.success(resp && resp.message, 5);
        Router.push('/auth/login');
        yield put(registerPerformerSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);
        message.error(error.message || 'This Username or email ID has been already taken.', 5);
        yield put(registerPerformerFail(error));
      }
    }
  },

  {
    on: logout,
    * worker() {
      try {
        yield authService.removeToken();
        yield put(resetAuth());
        yield put(resetUser());
        message.success('Log out!');
        // yield put(resetAppState());
        Router.push('/auth/login');
      } catch (e) {
        message.error('Something went wrong.');
      }
    }
  },

  {
    on: forgot,
    * worker(data: any) {
      try {
        const payload = data.payload as IForgot;
        const resp = (yield authService.resetPassword(payload)).data;
        message.success(
          'We\'ve sent an email to reset your password, please check your inbox.',
          5
        );
        yield put(forgotSuccess(resp));
      } catch (e) {
        const error = yield Promise.resolve(e);

        message.error((error && error.message) || 'Something went wrong. Please try again later', 5);
        yield put(forgotFail(error));
      }
    }
  }
];

export default flatten([createSagas(authSagas)]);
