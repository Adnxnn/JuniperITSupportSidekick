// Reviewed JSON is now authoritative. This compatibility command never overwrites it.
import {allProcedures,getTopics} from '../server/store.mjs';
console.log(`${allProcedures().length} reviewed procedures across ${getTopics().length} transcript topics. Edit data/training.json and restart to apply a reviewed update.`);
