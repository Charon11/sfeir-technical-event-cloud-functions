const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.userCreated = functions.auth.user().onCreate((user) => {
    return admin.firestore().collection('users').doc(user.uid).set(
        {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            photoURL: user.photoURL,
            phoneNumber: user.phoneNumber
        }
    ).then()
});

exports.grantAdminAccess = functions.pubsub.topic('grant-admin').onPublish(message => {
    const userId = message.attributes['uid']
    return admin.auth().setCustomUserClaims(userId, { admin: true }).then();
})

exports.publishSubjectEvent = functions.pubsub.topic('subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('subject-events').doc(event.id).set(event).then();
})

exports.eventAccepted = functions.pubsub.topic('accepted-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    const event = JSON.parse(data)
    console.log(event);
    return admin.firestore().collection('users').doc(event.userId).get().then(user => {
        const email = user.data().email
        return admin.firestore().collection('subject').doc(event.entityId).get().then(doc => {

            console.log(event);
            console.log(event.scheduleDate);
            const schedule = new Date(Date.parse(event.scheduleDate)).toLocaleDateString("fr-FR");
            console.log(schedule);
            return admin.firestore().collection('mail').doc().set(
                {
                    to: [email],
                    cc : ['chardin.r@sfeir.com, bodeving.l@sfeir.com, homberg.g@sfeir.com'],
                    template: {
                        name: 'event-accepted',
                        data: {
                            title: doc.data().title,
                            date: schedule
                        }
                    }
                }
            ).then();

        })
    })
})

exports.eventCreated = functions.pubsub.topic('created-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    console.log(data);
    const creatEvent = JSON.parse(data)
    return admin.firestore().collection('users').doc(creatEvent.userId).get().then(user => {
        const subject = {
            id: creatEvent.entityId,
            title: creatEvent.title,
            status: creatEvent.status,
            creationDate: new Date(creatEvent._ts),
            schedules: creatEvent.schedules ? creatEvent.schedules : [],
            record: creatEvent.record,
            subjectType: creatEvent.subjectType
        }
        if (creatEvent.description) {
            subject.description = creatEvent.description
        }
        subject.createdBy = user.data()
        console.log(subject)
        return admin.firestore().collection('mail').doc().set(
            {
                to: ['chardin.r@sfeir.com, bodeving.l@sfeir.com, homberg.g@sfeir.com'],
                template: {
                    name: 'event-created',
                    data: {
                        username: user.data().displayName,
                        title: subject.title,
                        type: subject.subjectType,
                        description: subject.description ? subject.description : 'No description'
                    }
                }
            }
        ).then();
    })

})

exports.publishSubjectCreatedEvent = functions.pubsub.topic('created-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    console.log(data);
    const creatEvent = JSON.parse(data)
    return admin.firestore().collection('users').doc(creatEvent.userId).get().then(user => {
        const subject = {
            id: creatEvent.entityId,
            title: creatEvent.title,
            status: creatEvent.status,
            creationDate: new Date(creatEvent._ts),
            schedules: creatEvent.schedules ? creatEvent.schedules : [],
            record: creatEvent.record,
            subjectType: creatEvent.subjectType
        }
        if (creatEvent.description) {
            subject.description = creatEvent.description
        }
        subject.createdBy = user.data()
        console.log(subject)
        return admin.firestore().collection('subject').doc(subject.id).set(subject).then();
    })

})

exports.publishSubjectDeletedEvent = functions.pubsub.topic('deleted-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('subject').doc(event.entityId).delete().then();
})

exports.publishSubjectAcceptedEvent = functions.pubsub.topic('accepted-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    const event = JSON.parse(data)
    console.log(event);
    return admin.firestore().collection('users').doc(event.userId).get().then(user => {
        const toUpdate = { status: event.status, acceptedBy: user.data(), scheduleDate: event.scheduleDate, updatedDate: new Date(event._ts) }
        if (event.link) {
            toUpdate.link = event.link
        }
        return admin.firestore().collection('subject').doc(event.entityId).update(toUpdate).then();
    })
})

exports.publishSubjectRefusedEvent = functions.pubsub.topic('refused-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('users').doc(event.userId).get().then(user => {
        return admin.firestore().collection('subject').doc(event.entityId).update({ status: event.status, refusedBy: user.data(), updatedDate: new Date(event._ts) }).then();
    })
})

exports.publishSubjectDescriptionChangedEvent = functions.pubsub.topic('description-changed-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('users').doc(event.userId).get().then(user => {
        return admin.firestore().collection('subject').doc(event.entityId).update({ description: event.description, updatedBy: user.data(), updatedDate: new Date(event._ts) }).then();
    })
})

exports.publishSubjectRecordAuthChangedEvent = functions.pubsub.topic('record-auth-changed-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('users').doc(event.userId).get().then(user => {
        return admin.firestore().collection('subject').doc(event.entityId).update({ record: event.record, updatedBy: user.data(), updatedDate: new Date(event._ts) }).then();
    })
})

exports.publishSubjectTitleChangedEvent = functions.pubsub.topic('title-changed-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('users').doc(event.userId).get().then(user => {
        return admin.firestore().collection('subject').doc(event.entityId).update({ title: event.title, updatedBy: user.data(), updatedDate: new Date(event._ts) }).then();
    })
})

exports.publishSubjectSchedulesChangedEvent = functions.pubsub.topic('schedules-changed-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('users').doc(event.userId).get().then(user => {
        return admin.firestore().collection('subject').doc(event.entityId).update({ schedules: event.schedules.map(s => new Date(s)), updatedBy: user.data(), updatedDate: new Date(event._ts) }).then();
    })
})

exports.publishSubjectTypeChangedEvent = functions.pubsub.topic('type-changed-subject-events').onPublish(message => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{"result":"no data"}';
    const event = JSON.parse(data)
    return admin.firestore().collection('users').doc(event.userId).get().then(user => {
        return admin.firestore().collection('subject').doc(event.entityId).update({ subjectType: event.subjectType, updatedBy: user.data(), updatedDate: new Date(event._ts) }).then();
    })
})
