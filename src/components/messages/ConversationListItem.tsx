/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Badge } from 'antd';
import './ConversationListItem.less';

interface IProps {
  data: any;
  setActive: Function;
  selected: boolean;
}

export default function ConversationListItem(props: IProps) {
  const { data, setActive, selected } = props;
  const {
    recipientInfo, lastMessage, _id, totalNotSeenMessages = 0
  } = data;
  const { avatar = '/no-avatar.png', isOnline = false, username } = recipientInfo;
  const className = selected
    ? 'conversation-list-item active'
    : 'conversation-list-item';

  return (
    <div
      className={className}
      onClick={() => setActive(_id)}
    >
      <div className="conversation-left-corner">
        <img className="conversation-photo" src={avatar || '/no-avatar.png'} alt="conversation" />
        <span className={isOnline ? 'online' : 'offline'} />
      </div>
      <div className="conversation-info">
        <h1 className="conversation-title">{username}</h1>
        <p className="conversation-snippet">{lastMessage}</p>
        {/* <p className="conversation-time">{moment(lastMessageCreatedAt ? lastMessageCreatedAt : updatedAt).fromNow()}</p> */}
      </div>
      <Badge
        className="notification-badge"
        count={totalNotSeenMessages}
      />
    </div>
  );
}
