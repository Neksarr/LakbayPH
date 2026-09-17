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
})();
