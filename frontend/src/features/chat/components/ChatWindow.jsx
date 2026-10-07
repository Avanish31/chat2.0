import React, { useLayoutEffect, useRef } from "react";
import SendBubble from "./SendBubble";
import RecieveBubble from "./RecieveBubble";
import BlockedBubble from "./BlockedBubble";
import { useSelector } from "react-redux";

function ChatWindow() {
  let messages = useSelector((state) => state.chat.messages);
  const user = useSelector((state) => state.auth.userData);
 const bottomRef = useRef(null);
  messages= messages.map((message) => ({
    ...message,
    messageTime: new Date(message.messageTime).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).toLowerCase()
}));
useLayoutEffect(() => {
  if (!messages.length) return;

  bottomRef.current?.scrollIntoView({
    behavior: "auto",
    block: "end",
  });
}, [messages.length]);

  return (
    <div
    
      className="h-[80%] overflow-y-auto text-white border-b border-b-blue-400 w-full no-scrollbar"
    >
      {messages.map((msg) => {
       
        if (msg.deleteBy?.includes(user.id)) {
          return null;
        }

        
        else if (msg.deletedForEveryOne) {
          if (msg.senderId === user.id) {
            return (
              <SendBubble
                key={msg._id || msg.tempId}
                message="This message was deleted"
                messageType={msg.messageType}
                status={msg?.status}
                time={msg.messageTime}
                id={msg?._id}
                deletedForEveryOne={msg.deletedForEveryOne}
              />
            );
          }

          return (
            <RecieveBubble
              key={msg._id || msg.tempId}
              message="This message was deleted"
              messageType={msg.messageType}
              time={msg.messageTime}
              id={msg?._id}
              deletedForEveryOne={msg.deletedForEveryOne}
            />
          );
        }

       
        else if (msg.senderId === user.id && msg.dummy === true) {
          return (
            <BlockedBubble
              key={msg._id || msg.tempId}
              message={msg.message}
            />
          );
        }

       
        else {
          if (msg.senderId === user.id) {
            return (
              <SendBubble
                key={msg._id || msg.tempId}
                message={msg.message}
                messageType={msg.messageType}
                status={msg?.status}
                time={msg.messageTime}
                id={msg?._id}
                deletedForEveryOne={msg.deletedForEveryOne}
                waitStatus={msg.receiveTime!=null?false:true}
              />
            );
          }

          return (
            <RecieveBubble
              key={msg._id || msg.tempId}
              message={msg.message}
              messageType={msg.messageType}
              time={msg.messageTime}
              id={msg?._id}
              deletedForEveryOne={msg.deletedForEveryOne}
            />
          );
        }
      })}
      <div ref={bottomRef} className="h-0 w-0">
    </div>

    </div>

  );
}

export default ChatWindow;