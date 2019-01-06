import React from "react";
import moment from "moment";
import { Comment, Image } from "semantic-ui-react";
import "emoji-mart/css/emoji-mart.css";
import { Emoji } from "emoji-mart";
const isOwnMessage = (message, user) => {
  return message.user.id === user.uid ? "message__self" : "";
};

const timeFromNow = timestamp => moment(timestamp).fromNow();

const isImage = message => {
  return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
};

const nl2br = str => {
  var newlineRegex = /(\r\n|\r|\n)/g;
  if (typeof str === "number") {
    return str;
  } else if (typeof str !== "string") {
    return str;
  } else if (typeof str === "undefined") {
    return "";
  }

  return str.split(newlineRegex).map(function(line, index) {
    if (line.match(newlineRegex)) {
      return React.createElement("br", { key: index });
    }
    return line;
  });
};

const displayEmoji = message => {
  let matchArr;
  let lastOffset = 0;
  const regex = new RegExp("(:[a-zA-Z0-9-_+]+:(:skin-tone-[2-6]:)?)", "g");
  const partsOfTheMessageText = [];

  while ((matchArr = regex.exec(message)) !== null) {
    const previousText = message.substring(lastOffset, matchArr.index);
    if (previousText.length) partsOfTheMessageText.push(previousText);

    lastOffset = matchArr.index + matchArr[0].length;

    const emoji = (
      <Emoji
        emoji={matchArr[0]}
        set="apple"
        size={20}
        fallback={(em, props) => {
          return em ? `:${em.short_names[0]}:` : props.emoji;
        }}
      />
    );

    if (emoji) {
      partsOfTheMessageText.push(emoji);
    } else {
      partsOfTheMessageText.push(matchArr[0]);
    }
  }
  const finalPartOfTheText = message.substring(lastOffset, message.length);
  if (finalPartOfTheText.length) partsOfTheMessageText.push(finalPartOfTheText);
  return (
    <div>
      {partsOfTheMessageText.map((p, i) => {
        return <span key={`msg-${i}`}>{nl2br(p)}</span>;
      })}
    </div>
  );
};

const Message = ({ message, user }) => (
  <Comment>
    <Comment.Avatar src={message.user.avatar} />
    <Comment.Content className={isOwnMessage(message, user)}>
      <Comment.Author as="a">{message.user.name}</Comment.Author>
      <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>

      {isImage(message) ? (
        <Image src={message.image} className="message__image" />
      ) : (
        <Comment.Text>{displayEmoji(message.content)}</Comment.Text>
      )}
    </Comment.Content>
  </Comment>
);

export default Message;
