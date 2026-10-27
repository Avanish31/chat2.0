import { Forward } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import sendMessageHelper from '../services/sendMessageHelper';
import sendMediaHelper from '../services/sendMediaHelper';
import { getSocket } from '../../../socket/socketClient';
import { getMediaFile } from '../services/indexedDbServices';
import { saveFile } from '../services/file';
import { clearSelectedForwardConversations, clearSelectedForwardMessages, updateForwardConversationSelectionMode, updateForwardMode } from '../state/chat';
import { setShowError } from '../state/media';

function ForwardButton() {
  const forwardSelectedMessages = useSelector(
    state => state.chat.forwardSelectedMessages
  );

  const forwardSelectedConversations = useSelector(
    state => state.chat.forwardSelectedConversations
  );

  const messages = useSelector(state => state.chat.messages);
  const friends = useSelector(state => state.chat.friends);
  const conversations = useSelector(state => state.chat.conversations);
  const mediaStore = useSelector(state => state.media.MediaStore);
  const userId = useSelector(state => state.auth.userData)?.id;
  const socket = getSocket();
  const dispatch = useDispatch();
  const handleForward = async () => {
          console.log("cicked");
    try {
     
      for (const id of forwardSelectedConversations) {
        console.log("hii  ",id)  ;
        const conversation = conversations?.byId[id];
      
        if (!conversation) continue;
            
        const conversationType = conversation.type;
        console.log("conversationnnns ",conversation);
        let selectedUserId = id;

        if (conversationType === 'dm') {
          selectedUserId = conversation.participants?.find(
            participantId => participantId !== userId
          );
        }

        let receiverId = [selectedUserId];

        if (conversationType === 'group') {
          receiverId = (conversation.participants ?? []).filter(
            participantId => participantId !== userId
          );
        }

        const blocked =
          conversationType === 'dm'
            ? friends?.byId?.[selectedUserId]?.blockedYou ?? false
            : false;

        for (const msgId of forwardSelectedMessages) {
          const msg = messages.find(
            message => message._id === msgId
          );
          console.log("sendMessageHelper",msg);

          if (!msg) continue;

          if (msg.messageType === 'text') {
            
             sendMessageHelper({
              message: msg.message,
              dispatch,
              conversationId: id,
              selectedUserId,
              conversations,
              senderId: userId,
              conversationType,
              friends,
              socket,
              forwardMode:true
            });
          } else if (msg.messageType === 'media') {
            const mediaId = msg.message;

            const file = await getMediaFile(
              msg.senderId === userId
                ? 'uploadedFiles'
                : 'downloadedFiles',
              mediaId
            );


            if (!file) {
              console.error('Media file not found:', mediaId);
              continue;
            }

            const tempId = crypto.randomUUID();

             saveFile(tempId, file.file);

            const media = mediaStore?.byId?.[mediaId];

            const selectedMedia = {
              byId: {
                [tempId]: {
                  mediaId: tempId,
                  preview: null,
                  icon: null,
                  category: media?.category,
                  type: media?.type,
                  name: media?.name,
                  size: media?.size,
                  caption: null,
                  pages: media?.pages,
                  mimeType: media?.mimeType,
                  validationErrors: [],
                  extension: media?.extension,
                },
              },
              allIds: [tempId],
            };

            await sendMediaHelper({
              allIds: selectedMedia.allIds,
              byId: selectedMedia.byId,
              dispatch,
              conversationId: id,
              senderId: userId,
              receiverId,
              conversationType,
              blocked,
              socket,
              forwardMode:true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error forwarding messages:', error);
    }
    dispatch(clearSelectedForwardConversations());
    dispatch(clearSelectedForwardMessages());
    dispatch(updateForwardConversationSelectionMode(false));
    dispatch(updateForwardMode(false));
  };

  return (
    <>
    <button type="button" onClick={()=>{
      if(forwardSelectedConversations.length>5){
        dispatch(setShowError("Max chats allowed are 5"));
      }
      else if(forwardSelectedConversations.length==0){
        dispatch(setShowError("select a chat to forward"));
      }
      else{
        handleForward();
      }
    }}>
      <Forward color="white" />
    </button>
    </>
  );
}

export default ForwardButton;