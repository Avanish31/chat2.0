let scheduling = {
    upload: false,
    download: false
};
import store from "../../../store";
import axios from "axios";
import { updateStatusUploadQueue } from "../state/media";
import { saveUploadAbortController } from "./abortController";
export function scheduleQueue({
    queueType,
    maxParallel,
    activeStatus,
    startTask
}) {
    if (scheduling[queueType]) return;

    scheduling[queueType] = true;
    
    try {
        while (true) {
            console.log("stuck");
            const queue =
                store.getState().media[`${queueType}Queue`];

            const active = queue.allIds.filter(id => {
                return queue.byId[id].status === activeStatus;
            }).length;

            if (active >= maxParallel) {
                break;
            }
            const nextId = queue.allIds.find(id => {
                return queue.byId[id].status === "pending";
            });

            if (!nextId) {
                break;
            }
            if(queueType==="download"){
            startTask(nextId);
            }
            else{
                store.dispatch(updateStatusUploadQueue({
                    mediaId:nextId,
                    status:"requesting"
                }))
                const controller=new AbortController();
                saveUploadAbortController(nextId,controller);
               axios.get(`/api/chat/checkEmptySlots/${nextId}`);
               
            }
        }
    } finally {
        scheduling[queueType] = false;
    }
}