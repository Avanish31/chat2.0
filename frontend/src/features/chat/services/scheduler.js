let scheduling = {
    upload: false,
    download: false
};
import store from "../../../store";
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

            startTask(nextId);
        }
    } finally {
        scheduling[queueType] = false;
    }
}