# Quiz result storage

The website works as static files on GitHub Pages. No build step or npm packages are required.

1. The web configuration for project `lakbayph-0` is already present in `firebase-config.js`.
2. Create a Cloud Firestore database if it does not exist, then configure rules for the `quizResults` collection. A live check currently returns `PERMISSION_DENIED`, so reads and writes will fail until the rules are updated.
3. Serve the site over HTTP(S), such as GitHub Pages, and complete a quiz. Confirm that one document appears in `quizResults`. Check the browser console if saving fails.

For this anonymous school/demo flow, a restricted create-only rule plus public result reads can be used:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quizResults/{attemptId} {
      allow read: if true;
      allow create: if
        request.resource.data.keys().hasOnly([
          'fullName', 'score', 'totalQuestions', 'correctAnswers',
          'incorrectAnswers', 'percentage', 'answers', 'completedAt'
        ]) &&
        request.resource.data.fullName is string &&
        request.resource.data.fullName.size() > 0 &&
        request.resource.data.fullName.size() <= 100 &&
        request.resource.data.score is int &&
        request.resource.data.totalQuestions is int &&
        request.resource.data.correctAnswers is int &&
        request.resource.data.incorrectAnswers is int &&
        request.resource.data.percentage is int &&
        request.resource.data.answers is list &&
        request.resource.data.answers.size() <= 20 &&
        request.resource.data.completedAt == request.time;
      allow update, delete: if false;
    }
  }
}
```

The password in the static page is only a visual demo gate. Since `allow read: if true` makes names and scores publicly readable through Firestore, use Firebase Authentication and authenticated read rules before collecting real student data.

The browser loads the modular Firebase SDK from Google's CDN. A completed attempt saves its full name, score, question count, correct/incorrect counts, percentage, answer details, and a server timestamp. Each attempt uses one generated document ID, and repeated Finish calls reuse the same write. Retake starts a new attempt. A failed network request never prevents the score from displaying.

Official references: [Firebase web setup](https://firebase.google.com/docs/web/setup), [Firestore writes](https://firebase.google.com/docs/firestore/manage-data/add-data), [Firestore security rules](https://firebase.google.com/docs/firestore/security/get-started).

Theme behavior is in `theme.js`, with shared navigation and theme colors in `navbar.css`. Theme icons use the root-level `dark.png` and `light.png` files. Local tourist photos remain in `ILS`; existing homepage ratings are preserved, and other catalog entries show “Not yet rated.” The El Nido quiz question uses the existing `home.jpg`, as there is no El Nido folder in `ILS`.
