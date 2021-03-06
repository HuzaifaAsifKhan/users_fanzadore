/* eslint-disable react/no-array-index-key */
import { PureComponent } from 'react';
import { IVideoResponse } from 'src/interfaces';
import './video.less';

interface IProps {
  video: IVideoResponse;
  style?: Record<string, string>;
}

export class ThumbnailVideo extends PureComponent<IProps> {
  render() {
    const { video: videoProp, style } = this.props;
    const { thumbnail, video } = videoProp;
    const url = thumbnail
      || (video && video.thumbnails && video.thumbnails.length > 0
        ? video.thumbnails[0]
        : '/video.png');
    return (
      <div className="video-thumbs">
        {videoProp.thumbnails && videoProp.thumbnails.length > 0
          ? videoProp.thumbnails.map((thumb) => <img alt="" key={thumb} src={thumb} style={style} />)
          : <img alt="" src={url} style={style} />}
      </div>
    );
  }
}
