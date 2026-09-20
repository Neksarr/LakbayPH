# Firebase storage

The website works as static files on GitHub Pages. No build step or npm packages are required.

1. The web configuration for project `lakbayph-0` is already present in `firebase-config.js`.
2. Create a Cloud Firestore database if it does not exist, then deploy the included `firestore.rules`. The rules cover both `quizResults` and public `destinationRatings`.
3. Serve the site over HTTP(S), such as GitHub Pages. Complete a quiz and submit a destination rating, then confirm documents appear in the matching collections.

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

    match /destinationRatings/{ratingId} {
      allow read: if true;
      allow create: if
        request.resource.data.keys().hasOnly([
          'destinationId', 'fullName', 'rating', 'description', 'createdAt'
        ]) &&
        request.resource.data.destinationId is string &&
        request.resource.data.destinationId.matches('^[a-z0-9-]+$') &&
        request.resource.data.destinationId.size() <= 100 &&
        request.resource.data.fullName is string &&
        request.resource.data.fullName.size() > 0 &&
        request.resource.data.fullName.size() <= 100 &&
        request.resource.data.rating is number &&
        request.resource.data.rating in [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] &&
        request.resource.data.description is string &&
        request.resource.data.description.size() <= 500 &&
        request.resource.data.createdAt == request.time;
      allow update, delete: if false;
    }
  }
}
```

Quiz result reads are public for this school project so the predefined-password results window can load saved attempts. The password is a visual gate in the static website; use Firebase Authentication and authenticated read rules before using this flow outside the project.

The browser loads the modular Firebase SDK from Google's CDN. Destination ratings are stored in `destinationRatings` with a destination ID, full name, half-star rating, optional description, and server timestamp. Public reads update destination averages, breakdowns, and review cards in real time. Writes are create-only, so public visitors cannot edit or delete existing entries.

A completed quiz attempt saves its full name, score, question count, correct/incorrect counts, percentage, answer details, and a server timestamp. Each attempt uses one generated document ID, and repeated Finish calls reuse the same write. Retake starts a new attempt. A failed network request never prevents the score from displaying.

Official references: [Firebase web setup](https://firebase.google.com/docs/web/setup), [Firestore writes](https://firebase.google.com/docs/firestore/manage-data/add-data), [Firestore security rules](https://firebase.google.com/docs/firestore/security/get-started).

Theme behavior is in `theme.js`, with shared navigation and theme colors in `navbar.css`. Theme icons use the root-level `dark.png` and `light.png` files. Local tourist photos remain in `ILS`; existing homepage ratings are preserved, and other catalog entries show “Not yet rated.” The El Nido quiz question uses the existing `home.jpg`, as there is no El Nido folder in `ILS`.
