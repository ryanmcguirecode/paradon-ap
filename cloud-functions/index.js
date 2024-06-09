const createDocumentMetadata = require("./createDocumentMetadata");

exports.createDocumentMetadata = createDocumentMetadata;

// npm start
//
// curl -X POST http://localhost:8080 -H "Content-Type: application/json" -d '{
//   "data": {
//     "name": "test.pdf",
//     "bucket": "paradon-ap-test",
//     "contentType": "application/json",
//     "metageneration": "1",
//     "timeCreated": "2020-04-23T07:38:57.230Z",
//     "updated": "2020-04-23T07:38:57.230Z"
//   },
//   "type": "google.cloud.storage.object.v1.finalized",
//   "specversion": "1.0",
//   "source": "//pubsub.googleapis.com/",
//   "id": "1234567890"
// }'
