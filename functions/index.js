const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();



exports.publishSubjectEvent = functions.pubsub.topic('subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('subject-events').doc(event.id).set(event).then();
})


exports.publishSubjectCreatedEvent = functions.pubsub.topic('created-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    console.log(data);
    const creatEvent = JSON.parse(data)
    const subject = {id: creatEvent.entityId, title: creatEvent.title, status: creatEvent.status, creationDate: new Date(creatEvent._ts)}
    if(creatEvent.description) {
        subject.description = creatEvent.description
    }
    console.log(subject)
    return admin.firestore().collection('subject').doc(subject.id).set(subject).then();
})

exports.publishSubjectDeletedEvent = functions.pubsub.topic('deleted-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('subject').doc(event.entityId).update({status: event.status, updatedDate: new Date(event._ts)}).then();
})

exports.publishSubjectAcceptedEvent = functions.pubsub.topic('accepted-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('subject').doc(event.entityId).update({status: event.status, scheduleDate: event.scheduleDate, updatedDate: new Date(event._ts)}).then();
})

exports.publishSubjectRefusedEvent = functions.pubsub.topic('refused-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('subject').doc(event.entityId).update({status: event.status, updatedDate: new Date(event._ts)}).then();
})

exports.publishSubjectDescriptionChangedEvent = functions.pubsub.topic('description-changed-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('subject').doc(event.entityId).update({description: event.description, updatedDate: new Date(event._ts)}).then();
})

exports.publishSubjectTitleChangedEvent = functions.pubsub.topic('title-changed-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('subject').doc(event.entityId).update({title: event.title, updatedDate: new Date(event._ts)}).then();
})

exports.publishSubjectSchedulesChangedEvent = functions.pubsub.topic('schedules-changed-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('subject').doc(event.entityId).update({schedules: event.schedules.map(s => new Date(s)), updatedDate: new Date(event._ts)}).then();
})
