import { EventEmitter } from 'events'

class EduTrackEventBus extends EventEmitter {}

const eventBus = new EduTrackEventBus()
export default eventBus