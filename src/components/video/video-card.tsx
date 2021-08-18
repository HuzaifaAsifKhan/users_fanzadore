import { PureComponent } from 'react';
import {
  EyeOutlined,
  LikeOutlined,
  HourglassOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { IVideo } from '../../interfaces';
import './video.less';

interface IProps {
  video: IVideo;
}

function timeDuration(s) {
  if (!s) {
    return '00:00';
  }
  const secNum: any = parseInt(s, 10); // don't forget the second param
  let hours: any = Math.floor(secNum / 3600);
  let minutes: any = Math.floor((secNum - hours * 3600) / 60);
  let seconds: any = secNum - hours * 3600 - minutes * 60;

  if (hours < 10) hours = `0${hours}`;
  if (minutes < 10) minutes = `0${minutes}`;
  if (seconds < 10) seconds = `0${seconds}`;
  return `${(hours ? `${hours}:` : '') + minutes}:${seconds}`;
}

export class VideoCard extends PureComponent<IProps> {
  render() {
    const { video } = this.props;
    return (
      <div className="vid-card">
        {video.isSaleVideo && video.price > 0 && (
          <span className="vid-price">
            <div className="label-price">
              $
              {video.price.toFixed(2)}
            </div>
          </span>
        )}
        <div className="vid-thumb">
          <Link
            href={{ pathname: '/video', query: { id: video._id } }}
            as={`/video/${video._id}`}
          >
            <a>
              <img
                alt={video.title}
                src={
                    // eslint-disable-next-line no-nested-ternary
                    video.thumbnail
                      ? video.thumbnail
                      : video.video.thumbnails
                        && video.video.thumbnails.length > 0
                        ? video.video.thumbnails[0]
                        : ''
                  }
              />
            </a>
          </Link>
          <Link
            href={{ pathname: '/video', query: { id: video._id } }}
            as={`/video/${video._id}`}
          >
            <div className="vid-stats">
              <span>
                <EyeOutlined />
                {' '}
                {video.stats && video.stats.views ? video.stats.views : 0}
              </span>
              <span>
                <LikeOutlined />
                {' '}
                {video.stats && video.stats.likes ? video.stats.likes : 0}
              </span>
              <span>
                <HourglassOutlined />
                {' '}
                {timeDuration(
                  video.video && video.video.duration ? video.video.duration : 0
                )}
              </span>
            </div>
          </Link>
        </div>
        <div className="vid-info">
          <Link
            href={{ pathname: '/video', query: { id: video._id } }}
            as={`/video/${video._id}`}
          >
            <span>{video.title}</span>
          </Link>
        </div>
      </div>
    );
  }
}
