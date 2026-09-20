// Firebase Web configuration for the LakbayPH demo project.
const firebaseConfig = {
  apiKey: 'AIzaSyDC8kuotenE41sgF0M1EPyAVozO5RC-wJQ',
  authDomain: 'lakbayph-0.firebaseapp.com',
  projectId: 'lakbayph-0',
  storageBucket: 'lakbayph-0.firebasestorage.app',
  messagingSenderId: '734354441432',
  appId: '1:734354441432:web:8f08542ffffc5a1baf43ad',
  measurementId: 'G-PCDGCT0XYW'
};

(() => {
  let connectionPromise;
  const attempts = new Map();

  function connect() {
    if (!connectionPromise) {
      connectionPromise = Promise.all([
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js')
      ]).then(([appSdk, firestore]) => {
        const app = appSdk.getApps().find(app => app.name === '[DEFAULT]') || appSdk.initializeApp(firebaseConfig);
        return { db: firestore.getFirestore(app), firestore };
      }).catch(error => {
        connectionPromise = undefined;
        throw error;
      });
    }
    return connectionPromise;
  }

  function withTimeout(operation) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Firestore request timed out.')), 15000);
    });
    return Promise.race([operation, timeout]).finally(() => clearTimeout(timer));
  }

  window.saveQuizResult = function (result, attemptId) {
    if (!attemptId || !result.fullName?.trim()) return Promise.reject(new Error('A named quiz attempt is required.'));
    // Cache the in-flight promise before any await, so duplicate calls share one write.
    if (!attempts.has(attemptId)) {
      const save = connect().then(async ({ db, firestore }) => {
        const { doc, setDoc, serverTimestamp } = firestore;
        await setDoc(doc(db, 'quizResults', attemptId), {
          fullName: result.fullName.trim(),
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          incorrectAnswers: result.incorrectAnswers,
          percentage: result.percentage,
          answers: result.answers,
          completedAt: serverTimestamp()
        });
        return true;
      });
      attempts.set(attemptId, withTimeout(save));
    }
    return attempts.get(attemptId);
  };

  window.loadQuizResults = function () {
    return withTimeout(connect().then(async ({ db, firestore }) => {
      const { collection, query, orderBy, getDocsFromServer } = firestore;
      const snapshot = await getDocsFromServer(query(collection(db, 'quizResults'), orderBy('completedAt', 'desc')));
      return snapshot.docs.map(document => ({ ...document.data(), id: document.id }));
    }));
  };

  window.saveDestinationRating = function (review) {
    const destinationId = review.destinationId?.trim();
    const fullName = review.fullName?.trim();
    const description = review.description?.trim() || '';
    const rating = Number(review.rating);
    const validRating = Number.isFinite(rating) && rating >= 0.5 && rating <= 5 && Number.isInteger(rating * 2);

    if (!destinationId || !/^[a-z0-9-]+$/.test(destinationId)) {
      return Promise.reject(new Error('A valid destination is required.'));
    }
    if (!fullName || fullName.length > 100) {
      return Promise.reject(new Error('Enter a full name with 100 characters or fewer.'));
    }
    if (!validRating) {
      return Promise.reject(new Error('Choose a full or half-star rating.'));
    }
    if (description.length > 500) {
      return Promise.reject(new Error('Keep the description within 500 characters.'));
    }

    return withTimeout(connect().then(async ({ db, firestore }) => {
      const { addDoc, collection, serverTimestamp } = firestore;
      const document = await addDoc(collection(db, 'destinationRatings'), {
        destinationId,
        fullName,
        rating,
        description,
        createdAt: serverTimestamp()
      });
      return document.id;
    }));
  };

  window.subscribeDestinationRatings = function (destinationId, onRatings, onError) {
    let active = true;
    let unsubscribe = () => {};

    connect().then(({ db, firestore }) => {
      if (!active) return;
      const { collection, onSnapshot, query, where } = firestore;
      const ratingsQuery = query(
        collection(db, 'destinationRatings'),
        where('destinationId', '==', destinationId)
      );
      unsubscribe = onSnapshot(ratingsQuery, snapshot => {
        const ratings = snapshot.docs.map(document => ({ ...document.data(), id: document.id }));
        onRatings(ratings);
      }, error => onError?.(error));
    }).catch(error => onError?.(error));

    return () => {
      active = false;
      unsubscribe();
    };
  };
})();
