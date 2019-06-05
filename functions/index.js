const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.publishSubjectCreatedEvent = functions.pubsub.topic('created-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    console.log(data);
    return admin.firestore().collection('subject-events').doc().set(JSON.parse(data)).then();
})

exports.publishSubjectDeletedEvent = functions.pubsub.topic('deleted-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    console.log(data);
    return admin.firestore().collection('subject-events').doc().set(JSON.parse(data)).then();
})

exports.publishSubjectAcceptedEvent = functions.pubsub.topic('accepted-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    console.log(data);
    return admin.firestore().collection('subject-events').doc().set(JSON.parse(data)).then();
})

exports.publishSubjectRefusedEvent = functions.pubsub.topic('refused-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    console.log(data);
    return admin.firestore().collection('subject-events').doc().set(JSON.parse(data)).then();
})

exports.publishSubjectDescriptionChangedEvent = functions.pubsub.topic('description-changed-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    console.log(data);
    return admin.firestore().collection('subject-events').doc().set(JSON.parse(data)).then();
})

exports.publishSubjectTitleChangedEvent = functions.pubsub.topic('title-changed-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString(): '{"result":"no data"}';
    console.log(data);
    return admin.firestore().collection('subject-events').doc().set(JSON.parse(data)).then();
})
